package article

import (
	"fmt"
	"path/filepath"

	"musenova.de/filefinder/internal/config"
	fshelper "musenova.de/filefinder/internal/fs-helper"
	"musenova.de/filefinder/internal/gen"
)

func GetArticle(config config.AppConfig, number string) (gen.Article, error) {
	path, err := fshelper.GetFilePath(config, number)
	if err != nil {
		return gen.Article{}, fmt.Errorf("no article with number %v found", number)
	}
	files, hasData := fshelper.AnalyseDirectory(config, number, path)

	uploadPath := fshelper.GetUploadFolder(config, number)

	uploadFiles, hasUploadData := fshelper.AnalyseDirectory(config, number, uploadPath)

	if !hasData && !hasUploadData {
		return gen.Article{}, fmt.Errorf("no article with number %v found", number)
	}
	if hasUploadData {
		uploadName := "UPLOAD"
		uploadType := gen.Folder
		files = append(files, gen.FileSystem{
			Name:     &uploadName,
			Type:     &uploadType,
			Children: &uploadFiles,
		})
	}
	return gen.Article{
		Number: &number,
		Files:  &files,
	}, nil
}

func GetDefaultArticleFiles(config config.AppConfig, number string) (gen.Article, error) {
	path, err := fshelper.GetFilePath(config, number)
	if err != nil {
		return gen.Article{}, fmt.Errorf("no article with number %v found", number)
	}
	path = filepath.Join(path, "PDU")
	files, hasData := fshelper.AnalyseDirectoryFlat(config, number, path)

	if !hasData {
		return gen.Article{}, fmt.Errorf("no article with number %v found", number)
	}

	return gen.Article{
		Number: &number,
		Files:  &files,
	}, nil
}
