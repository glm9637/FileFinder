package validator

import (
	"io/fs"
	"log"
	"path/filepath"
	"regexp"
	"slices"
	"strings"

	"musenova.de/filefinder/internal/config"
)

func ValidateArticle(number string) bool {
	return regexp.MustCompile("^[a-zA-Z0-9]{7}$").MatchString(number)
}

func IsAllowedFile(config config.AppConfig, file fs.DirEntry) bool {
	if file.IsDir() {
		return false
	}
	extension := strings.ToLower(filepath.Ext(file.Name()))
	log.Printf("%v is allowed: %v", extension[1:], slices.Contains(config.Files, extension[:1]))
	return slices.Contains(config.Files, extension[1:])
}

func IsAllowedDir(config config.AppConfig, file fs.DirEntry) bool {
	if !file.IsDir() {
		return false
	}

	log.Printf("%v is allowed: %v", file, slices.Contains(config.Folders, file.Name()))
	return slices.Contains(config.Folders, file.Name())
}
