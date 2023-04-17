package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/joho/godotenv"
)

const PATH_ENV = "ROOT_PATH"
const FILES_ENV = "ALLOWED_FILES"
const FOLDERS_ENV = "ALLOWED_FOLDERS"
const PORT_ENV = "PORT"
const UPLOAD_FOLDER = "UPLOAD_FOLDER"
const UPLOAD_TO_ARTICLE_FOLDER = "UPLOAD_TO_ARTICLE_FOLDER"

type File struct {
	Path string
	Name string
}

type Directory struct {
	Name     string
	Children []Directory
	Files    []File
}

func main() {
	loadEnvFile()
	printSettings()

	router := chi.NewRouter()
	router.Route("/api", setupApi)
	router.Handle("/*", http.FileServer(http.Dir("./wwwroot")))
	err := http.ListenAndServe(":"+os.Getenv(PORT_ENV), router)
	if err != nil {
		fmt.Println(err)
		fmt.Println("Server konnte nicht gestartet werden, vermutlich ist der Port bereits in Verwendung")
		fmt.Scanln()
	}
}

func printSettings() {
	hostname, err := os.Hostname()
	if err != nil {
		panic(err)
	}
	port := os.Getenv(PORT_ENV)
	path := os.Getenv(PATH_ENV)
	files := os.Getenv(FILES_ENV)
	folders := os.Getenv(FOLDERS_ENV)
	uploadFolder := os.Getenv(UPLOAD_FOLDER)
	uploadToArticleFolder := os.Getenv(UPLOAD_TO_ARTICLE_FOLDER)
	if uploadFolder == "" {
		uploadFolder = "img"
	}
	fmt.Printf("Dateisuche erreichbar unter 'http://%s:%s'\n", hostname, port)
	fmt.Printf("Dateien werden in dem Pfad '%s' gesucht\n", path)
	fmt.Printf("Es werden Dateien mit den endungen '%s' gesucht\n", files)
	fmt.Printf("Es werden Dateien in den Unterordnern '%s' gesucht\n", folders)
	if uploadToArticleFolder == "1" {
		fmt.Printf("Fotos werden in der zugehörigen Artikelordner gespeichert\n")
	}
	fmt.Printf("Fotos werden in dem Pfad '%s' gespeichert\n", uploadFolder)
}

func loadEnvFile() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func setupApi(router chi.Router) {
	router.Get("/search/{number}", searchFiles)
	router.Get("/file/{number}/{name}", serveFile)
	router.Post("/file/{number}", uploadFile)
}

func uploadFile(writer http.ResponseWriter, request *http.Request) {
	article := chi.URLParam(request, "number")
	if !validateArticle(article) {
		writer.WriteHeader(400)
		return
	}
	file, fileHeader, err := request.FormFile("photo")
	if err != nil {
		writer.WriteHeader(501)
		fmt.Printf("%v", err)
		return
	}
	path, err := getUploadFolder(article)
	if err != nil {
		writer.WriteHeader(501)
		fmt.Printf("%v", err)
		return
	}
	destinationPath := filepath.Join(path, fmt.Sprintf("%v_%v%v", article, time.Now().UnixNano(), filepath.Ext(fileHeader.Filename)))
	destination, err := os.Create(destinationPath)
	defer destination.Close()

	_, err = io.Copy(destination, file)
	if err != nil {
		writer.WriteHeader(501)
		fmt.Printf("%v", err)
		return
	}
}

func getUploadFolder(article string) (string, error) {
	uploadFolder := os.Getenv(UPLOAD_FOLDER)
	if uploadFolder == "" {
		uploadFolder = "img"
	}
	if os.Getenv(UPLOAD_TO_ARTICLE_FOLDER) == "1" {
		uploadFolder = filepath.Join(getFilePath(article), uploadFolder)
	}
	err := os.MkdirAll(uploadFolder, os.ModePerm)
	return uploadFolder, err
}

func serveFile(writer http.ResponseWriter, request *http.Request) {
	article := chi.URLParam(request, "number")
	if !validateArticle(article) {
		writer.WriteHeader(400)
		return
	}
	path := getFilePath(article)
	filename := chi.URLParam(request, "name")
	filename, err := url.QueryUnescape(filename)
	if err != nil {
		writer.WriteHeader(400)
		return
	}
	fmt.Printf("Serving file: %v\n", filename)
	file, err := os.ReadFile(filepath.Join(path, filename))
	if err != nil {
		writer.WriteHeader(404)
		return
	}

	writer.Write(file)
}

func searchFiles(writer http.ResponseWriter, request *http.Request) {
	article := chi.URLParam(request, "number")
	if !validateArticle(article) {
		writer.WriteHeader(400)
		return
	}
	path := getFilePath(article)
	fmt.Println(path)
	result, ok := AnalyseDirectory(article, path)
	if !ok {
		writer.WriteHeader(404)
		return
	}
	result.Name = article
	writer.Header().Add("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(result)
}

func AnalyseDirectory(article string, path string) (directory Directory, hasData bool) {
	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Der Pfad %v konnte nicht gelesen werden.\n%v", path, err)
		hasData = false
		return
	}
	for _, fi := range files {
		if isAllowedDir(fi) {
			result, ok := AnalyseDirectory(article, filepath.Join(path, fi.Name()))
			if ok {
				hasData = true
				result.Name = fi.Name()
				directory.Children = append(directory.Children, result)
			}
			continue
		}
		if isAllowedFile(fi) {
			hasData = true
			directory.Files = append(directory.Files, File{Name: fi.Name(), Path: getRelativePath(article, path, fi)})
		}
	}
	return
}

func validateArticle(number string) bool {
	return regexp.MustCompile("^[a-zA-Z0-9]{7}$").MatchString(number)
}

func getFilePath(number string) string {
	path := filepath.Join(os.Getenv(PATH_ENV))
	for _, v := range regexp.MustCompile("(^.|..)").FindAllString(number, -1) {
		path = filepath.Join(path, v)
	}
	return path
}

func isAllowedFile(file fs.DirEntry) bool {
	if file.IsDir() {
		return false
	}
	extension := filepath.Ext(file.Name())
	return isInEnvironment(extension[1:], FILES_ENV)
}

func isAllowedDir(file fs.DirEntry) bool {
	if !file.IsDir() {
		return false
	}
	return isInEnvironment(file.Name(), FOLDERS_ENV)
}

func isInEnvironment(name string, environmentVariable string) bool {
	for _, v := range strings.Split(os.Getenv(environmentVariable), ",") {

		if strings.EqualFold(v, name) {
			return true
		}
	}
	return false
}

func getRelativePath(article string, path string, file fs.DirEntry) string {
	fullPath := filepath.Join(path, file.Name())
	rootPath := getFilePath(article)
	return strings.Replace(fullPath, rootPath, "", 1)
}
