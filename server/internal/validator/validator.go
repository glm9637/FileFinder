package validator

import (
	"io/fs"
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
	return slices.Contains(config.Files, extension[1:])
}

func IsPDFFile(file fs.DirEntry) bool {
	if file.IsDir() {
		return false
	}
	extension := strings.ToLower(filepath.Ext(file.Name()))
	return extension[1:] == "pdf"
}
func IsAllowedDir(config config.AppConfig, file fs.DirEntry) bool {
	if !file.IsDir() {
		return false
	}

	return slices.Contains(config.Folders, file.Name())
}
