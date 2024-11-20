package bom

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"musenova.de/filefinder/internal/config"
	fshelper "musenova.de/filefinder/internal/fs-helper"
	"musenova.de/filefinder/internal/gen"
)

func GetBom(config config.AppConfig, number string) (gen.BOM, error) {
	path, err := fshelper.GetFilePath(config, number)
	if err != nil {
		return gen.BOM{}, err
	}
	path = filepath.Join(path, config.STLFolder)

	files, err := os.ReadDir(path)
	if err != nil {
		return gen.BOM{}, err
	}
	materials := make([]gen.Material, 0)

	for _, fi := range files {
		if fi.IsDir() || filepath.Ext(fi.Name()) != ".txt" {
			continue
		}

		fshelper.ReadCsv(filepath.Join(path, fi.Name()), func(s []string) {
			name := s[3]
			number := s[1]
			materials = append(materials, gen.Material{
				Name:   &name,
				Number: &number,
			})
		})
		return gen.BOM{
			Materials: &materials,
			Name:      &number,
		}, nil

	}
	return gen.BOM{}, fmt.Errorf("no stl file found for article %v", number)
}

func GetFullBom(config config.AppConfig, number string) (gen.FullBom, error) {
	root, err := GetBom(config, number)
	if err != nil {
		if !strings.Contains(err.Error(), "no stl file found") {
			return gen.FullBom{}, err
		}
		return gen.FullBom{}, nil
	}

	children := make([]gen.FullBom, len(*root.Materials))
	for i, material := range *root.Materials {
		current := gen.FullBom{}
		current.Number = material.Number
		current.Name = material.Name
		fullBom, err := GetFullBom(config, *material.Number)
		if err == nil {
			current.Children = fullBom.Children
		}

		children[i] = current
	}
	return gen.FullBom{
		Number:   &number,
		Children: &children,
	}, nil
}
