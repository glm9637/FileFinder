package main

import (
	"log"
	"path/filepath"
	"testing"

	"musenova.de/filefinder/internal/bom"
	"musenova.de/filefinder/internal/config"
)

func fakeConfig() config.Config {
	return config.Config{
		App: config.AppConfig{
			Path:                  "/mnt/c/Users/fenge/source/Ordnerstruktur/",
			Files:                 []string{"pdf", "jpg", "jpeg", "png"},
			Folders:               []string{"INFO", "PDU", "TO", "GESAMT"},
			UploadFolder:          "upload",
			UploadToArticleFolder: "1",
			STLFolder:             filepath.Join("STAMM", "STL"),
		},
		Server: config.ServerConfig{
			Hostname: "localhost",
			Port:     "8080",
		},
	}
}

func BenchmarkBomLoad(b *testing.B) {
	config := fakeConfig()

	for n := 0; n < b.N; n++ {
		result, err := bom.GetBom(config.App, "9000052")
		log.Println(result)
		if err != nil {
			log.Println(err)
		}
		log.Println(*result.Number)
	}
}

func TestBomLoad(T *testing.T) {
	config := fakeConfig()

	result, err := bom.GetBom(config.App, "9000052")
	log.Println(result)
	if err != nil {
		log.Println(err)
	}
}
