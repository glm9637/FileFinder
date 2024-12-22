package server

import (
	"net/http"

	"musenova.de/filefinder/internal/api"
	"musenova.de/filefinder/internal/config"
	"musenova.de/filefinder/internal/gen"
)

func CreateServer(config config.Config) *http.Server {
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
