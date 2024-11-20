package main

import (
	"log"

	"musenova.de/filefinder/internal/config"
	"musenova.de/filefinder/internal/server"
)

func main() {
	config, err := config.GetConfig()
	if err != nil {
		log.Fatal(err)
	}
	config.Print()
	server := server.CreateServer(config)

	log.Fatal(server.ListenAndServe())
}
