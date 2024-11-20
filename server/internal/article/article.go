package article

import (
	"fmt"

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
	if !hasData {
		return gen.Article{}, fmt.Errorf("no article with number %v found", number)
	}
	return gen.Article{
		Number: &number,
		Files:  &files,
	}, nil
}
