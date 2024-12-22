#!/bin/bash

cd server
GOOS=windows GOARCH=amd64 go build -o ../build/filefinder.exe ./cmd/server/server.go
cd ../client
npm run build