package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"musenova.de/filefinder/internal/article"
	"musenova.de/filefinder/internal/bom"
	"musenova.de/filefinder/internal/config"
	fshelper "musenova.de/filefinder/internal/fs-helper"
	"musenova.de/filefinder/internal/gen"
	"musenova.de/filefinder/internal/validator"
)

// optional code omitted

type Server struct {
	config config.Config
}

// GetArticleFile implements gen.ServerInterface.
func (s Server) GetArticleFile(w http.ResponseWriter, r *http.Request, number string) {
	filePath, err := article.GetDefaultFilePath(s.config.App, number)
	if err != nil {
		log.Println(err.Error())
		writeNotFound(w, r)
		return
	}
	file, err := os.ReadFile(filePath)
	if err != nil {
		writeNotFound(w, r)
		return
	}
	w.Header().Add("Cache-Control", "no-cache")
	w.Write(file)

}

func writeNotFound(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte(`
	<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <img src="../../../no-result.svg" alt="No Result" style="width:40rem; margin: 8rem" />
  </body>
</html>`))
}

// GetArticle implements ServerInterface.
func (s Server) GetArticle(w http.ResponseWriter, r *http.Request, number string) {
	response, err := article.GetArticle(s.config.App, number)

	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

// GetBom implements ServerInterface.
func (s Server) GetBom(w http.ResponseWriter, r *http.Request, number string) {
	response, err := bom.GetBom(s.config.App, number)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
	}
	_ = json.NewEncoder(w).Encode(response)
}

// GetFullBom implements ServerInterface.
func (s Server) GetFullBom(w http.ResponseWriter, r *http.Request, number string) {
	response, err := bom.GetFullBom(s.config.App, number)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
	}
	_ = json.NewEncoder(w).Encode(response)
}

// GetFile implements ServerInterface.
func (s Server) GetFile(w http.ResponseWriter, r *http.Request, number string, path string) {
	if !validator.ValidateArticle(number) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	articlePath, err := fshelper.GetFilePath(s.config.App, number)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	file, err := os.ReadFile(filepath.Join(articlePath, path))
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Add("Cache-Control", "no-cache")
	w.Write(file)
}

// UploadFile implements ServerInterface.
func (s Server) UploadFile(w http.ResponseWriter, r *http.Request, number string) {
	if !validator.ValidateArticle(number) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	file, fileHeader, err := r.FormFile("photo")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("%v", err)
		return
	}

	path, err := fshelper.GetUploadFolder(s.config.App, number, fileHeader.Filename)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("%v", err)
		return
	}
	err = fshelper.UploadFile(path, file)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("%v", err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func NewServer(config config.Config) gen.ServerInterface {
	return Server{config: config}
}
