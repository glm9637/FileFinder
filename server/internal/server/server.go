package server

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"musenova.de/filefinder/internal/api"
	"musenova.de/filefinder/internal/config"
	fshelper "musenova.de/filefinder/internal/fs-helper"
	"musenova.de/filefinder/internal/gen"
)

func CreateServer(config config.Config) *http.Server {
	// to avoid the page from havin to request the title, we just create a new version of the index with a valid title
	createIndexFile(config.Server)
	// create a type that satisfies the `api.ServerInterface`, which contains an implementation of every operation from the generated code
	server := api.NewServer(config)

	r := http.NewServeMux()

	// get an `http.Handler` that we can use
	h := gen.HandlerFromMuxWithBaseURL(server, r, "/api")
	fs := http.FileServer(http.Dir("./wwwroot/browser"))
	r.Handle("/*", noCache(fs))

	s := &http.Server{
		Handler: h,
		Addr:    "0.0.0.0:" + config.Server.Port,
	}

	return s
}

func noCache(fs http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		w.Header().Add("Cache-Control", "no-cache")
		fs.ServeHTTP(w, r)
	}
}

func createIndexFile(config config.ServerConfig) error {
	htmlBasePath := filepath.Join("wwwroot", "browser", "index.html")
	backupPath := filepath.Join("wwwroot", "browser", "index.html.bak")
	if !fshelper.Exists(backupPath) {
		if err := fshelper.Copy(htmlBasePath, backupPath); err != nil {
			return err
		}
	}
	input, err := os.ReadFile(htmlBasePath)
	if err != nil {
		return err
	}
	lines := strings.Split(string(input), "\n")
	for i, line := range lines {
		if strings.Contains(line, "<title>") {
			lines[i] = fmt.Sprintf("<title>%s</title>", config.AppName)
			break
		}
	}
	output := strings.Join(lines, "\n")
	if err := os.WriteFile(htmlBasePath, []byte(output), 0644); err != nil {
		return err
	}

	return nil
}
