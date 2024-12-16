#!/bin/bash

cd server
go generate ./tools/tools.go

cd ../client
npm run generate