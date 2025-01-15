package api

import (
	"encoding/json"
	"fmt"
	"io"
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
func (s Server) GetArticleFiles(w http.ResponseWriter, r *http.Request, number string) {
	response, err := article.GetDefaultArticleFiles(s.config.App, number)
	if err != nil {
		log.Println(err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)

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
	chunk := make([]byte, 4096)
	hasError := false
	count := 1
	fmt.Println(r.MultipartForm)
	rd, err := r.MultipartReader()
	if err != nil {
		log.Printf("%v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	for {
		part, err := rd.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			hasError = true
			log.Printf("%v", err)
			break
		}

		destinationPath, err := fshelper.GetUploadPath(s.config.App, number, part.FileName(), count)
		if err != nil {
			hasError = true
			log.Printf("%v", err)
			continue
		}
		count++
		destination, err := os.Create(destinationPath)
		if err != nil {
			hasError = true
			log.Printf("%v", err)
			continue
		}

		defer destination.Close()

		var uploaded bool
		for !uploaded {
			var n int
			if n, err = part.Read(chunk); err != nil {
				if err != io.EOF {
					log.Printf("Hit error while reading chunk: %s", err.Error())
					w.WriteHeader(500)
					fmt.Fprintf(w, "Error occured during upload")
					return
				}
				uploaded = true
			}

			if _, err = destination.Write(chunk[:n]); err != nil {
				log.Printf("Hit error while writing chunk: %s", err.Error())
				w.WriteHeader(500)
				fmt.Fprintf(w, "Error occured during upload")
				return
			}
		}

	}
	if hasError {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func NewServer(config config.Config) gen.ServerInterface {
	return Server{config: config}
}
