package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/joho/godotenv"
)

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
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Route("/api", setupApi)
	router.Handle("/*", http.FileServer(http.Dir("./wwwroot")))
	http.ListenAndServe(":80", router)
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
}

func serveFile(writer http.ResponseWriter, request *http.Request) {
	article := chi.URLParam(request, "number")
	if !validateArticle(article) {
		writer.WriteHeader(400)
		return
	}
	path := getFilePath(article)
	filename := chi.URLParam(request, "name")
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
	path := filepath.Join(os.Getenv("ROOT_PATH"))
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
	return isInEnvironment(extension[1:], "ALLOWED_FILES")
}

func isAllowedDir(file fs.DirEntry) bool {
	if !file.IsDir() {
		return false
	}
	return isInEnvironment(file.Name(), "ALLOWED_FOLDERS")
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
