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

	s := &http.Server{
		Handler: h,
		Addr:    "0.0.0.0:" + config.Server.Port,
	}

	return s
}
