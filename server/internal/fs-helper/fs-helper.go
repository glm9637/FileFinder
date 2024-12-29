package fshelper

import (
	"bufio"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"musenova.de/filefinder/internal/config"
	"musenova.de/filefinder/internal/gen"
	"musenova.de/filefinder/internal/validator"
)

func AnalyseDirectory(config config.AppConfig, article string, path string) (directory []gen.FileSystem, hasData bool) {
	directory = make([]gen.FileSystem, 0)

	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Der Pfad %v konnte nicht gelesen werden.\n%v", path, err)
		hasData = false
		return directory, false
	}

	for _, fi := range files {
		if validator.IsAllowedDir(config, fi) {

			result, ok := AnalyseDirectory(config, article, filepath.Join(path, fi.Name()))

			if ok {
				current := gen.FileSystem{}
				fileName := fi.Name()
				fileType := gen.Folder
				hasData = true
				current.Name = &fileName
				current.Type = &fileType
				current.Children = &result
				directory = append(directory, current)
			}
			continue
		}
		if validator.IsAllowedFile(config, fi) {
			fileName := fi.Name()
			fileType := gen.File
			relativePath, _ := getRelativePath(config, article, path, fi)

			current := gen.FileSystem{}
			current.Name = &fileName
			current.Type = &fileType
			current.Path = &relativePath
			directory = append(directory, current)
		}
	}
	return directory, len(directory) > 0
}

func GetDefaultFile(config config.AppConfig, article string, path string) (file string, hasData bool) {

	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Der Pfad %v konnte nicht gelesen werden.\n%v", path, err)
		hasData = false
		return "", false
	}

	for _, fi := range files {
		if validator.IsAllowedDir(config, fi) {

			result, ok := GetDefaultFile(config, article, filepath.Join(path, fi.Name()))
			if ok {
				return result, ok
			}
			continue
		}
		if validator.IsAllowedFile(config, fi) {
			return filepath.Join(path, fi.Name()), true
		}
	}
	return "", false
}

func UploadFile(path string, file multipart.File) error {
	destination, err := os.Create(path)
	if err != nil {
		return err
	}
	defer destination.Close()
	_, err = io.Copy(destination, file)
	if err != nil {
		return err
	}

	return nil
}

func GetUploadFolder(config config.AppConfig, article string, filename string) (string, error) {
	uploadFolder := config.UploadFolder
	if uploadFolder == "" {
		uploadFolder = "img"
	}
	if config.UploadToArticleFolder == "1" {
		uploadFolder = filepath.Join(uploadFolder, article)
	}
	err := os.MkdirAll(uploadFolder, os.ModePerm)
	if err != nil {
		return "", err
	}
	destinationPath := filepath.Join(uploadFolder, fmt.Sprintf("%v_%v%v", article, time.Now().UnixNano(), filepath.Ext(filename)))
	return destinationPath, nil
}

func GetFilePathWithSubstring(config config.AppConfig, number string, subpath string) (string, error) {
	path := filepath.Join(config.Path, number[:1], number[1:3], number[3:5], number[5:7], subpath)
	if !exists(path) {
		return "", fmt.Errorf("path %v does not exist or can't be accessed", path)
	}

	return path, nil
}

func GetFilePath(config config.AppConfig, number string) (string, error) {

	path := filepath.Join(config.Path, number[:1], number[1:3], number[3:5], number[5:7])
	if !exists(path) {
		return "", fmt.Errorf("path %v does not exist or can't be accessed", path)
	}

	return path, nil
}

func getRelativePath(config config.AppConfig, article string, path string, file fs.DirEntry) (string, error) {
	fullPath := filepath.Join(path, file.Name())
	rootPath, err := GetFilePath(config, article)
	if err != nil {
		return "", err
	}
	return strings.Replace(fullPath, rootPath, "", 1), nil
}

func ReadCsv(path string, handler func([]string)) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	skipLine := true
	for scanner.Scan() {
		line := scanner.Text()
		if skipLine {
			skipLine = false
			continue
		}
		handler(strings.Split(line, "	"))
	}
	return scanner.Err()
}

func exists(path string) bool {
	_, err := os.Stat(path)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}
