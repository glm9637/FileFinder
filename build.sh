#!/usr/bin/env sh

go build .
cd wwwroot
npx tsc
cd ..
rm -r build
mkdir build
cp dateisuche.exe build
cp .env build
cp -r wwwroot build
rm build/wwwroot/tsconfig.json
rm build/wwwroot/index.ts
rm dateisuche.exe