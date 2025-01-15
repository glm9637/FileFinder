package fshelper

import (
	"bufio"
	"fmt"
	"io"
	"io/fs"
	"log"
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

func AnalyseDirectoryFlat(config config.AppConfig, article string, path string) (directory []gen.FileSystem, hasData bool) {
	directory = make([]gen.FileSystem, 0)

	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Der Pfad %v konnte nicht gelesen werden.\n%v", path, err)
		hasData = false
		return directory, false
	}

	for _, fi := range files {
		if fi.IsDir() {

			continue
		}
		if validator.IsPDFFile(fi) {
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

func GetDefaultFile(config config.AppConfig, article string, path string, validParent bool) (file string, hasData bool) {

	files, err := os.ReadDir(path)
	if err != nil {
		log.Printf("Der Pfad %v konnte nicht gelesen werden.\n%v", path, err)
		hasData = false
		return "", false
	}

	for _, fi := range files {
		if fi.IsDir() {
			if fi.Name() != "PDU" {
				continue
			}
			return GetDefaultFile(config, article, filepath.Join(path, fi.Name()), true)
		}
		if validParent && validator.IsPDFFile(fi) {
			return filepath.Join(path, fi.Name()), true
		}
	}
	return "", false
}

func GetUploadFolder(config config.AppConfig, article string) (string, error) {
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
	return uploadFolder, nil
}

func GetUploadPath(config config.AppConfig, article string, filename string, count int) (string, error) {
	uploadFolder, err := GetUploadFolder(config, article)
	if err != nil {
		return "", err
	}
	destinationPath := filepath.Join(uploadFolder, fmt.Sprintf("%v_%v_%v%v", article, time.Now().Format("20060102150405"), count, filepath.Ext(filename)))

	return destinationPath, nil
}

func GetFilePathWithSubstring(config config.AppConfig, number string, subpath string) (string, error) {
	path := filepath.Join(config.Path, number[:1], number[1:3], number[3:5], number[5:7], subpath)
	if !Exists(path) {
		return "", fmt.Errorf("path %v does not exist or can't be accessed", path)
	}

	return path, nil
}

func GetFilePath(config config.AppConfig, number string) (string, error) {

	path := filepath.Join(config.Path, number[:1], number[1:3], number[3:5], number[5:7])
	if !Exists(path) {
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
	return filepath.Rel(rootPath, fullPath)
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

func Exists(path string) bool {
	_, err := os.Stat(path)
	if err == nil {
		return true
	}
	if os.IsNotExist(err) {
		return false
	}
	return false
}

func Copy(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	if err != nil {
		return err
	}
	return out.Close()
}
