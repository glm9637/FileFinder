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
	path := getFilePath(chi.URLParam(request, "number"))
	filename := chi.URLParam(request, "name")
	file, err := os.ReadFile(filepath.Join(path, filename))
	if err != nil {
		//TODO: handle error
		writer.WriteHeader(404)
		return
	}
	writer.Write(file)
}

func searchFiles(writer http.ResponseWriter, request *http.Request) {
	path := getFilePath(chi.URLParam(request, "number"))
	fmt.Println(path)
	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Der Pfad %v konnte nicht gelesen werden.\n%v", path, err)
		writer.WriteHeader(404)
		return
	}
	var result []string

	for _, fi := range files {
		if isAllowedFile(fi) {
			result = append(result, fi.Name())
		}
	}

	if len(result) == 0 {
		writer.WriteHeader(404)
		return
	}
	writer.Header().Add("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(result)
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
	for _, v := range strings.Split(os.Getenv("ALLOWED_FILES"), ",") {
		if "."+v == extension {
			return true
		}
	}
	return false
}
