package bom

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"slices"
	"sync"

	"musenova.de/filefinder/internal/config"
	fshelper "musenova.de/filefinder/internal/fs-helper"
	"musenova.de/filefinder/internal/gen"
)

type entry struct {
	Index    string
	Number   string
	Name     string
	Children []entry
}

type safeKnownArticles struct {
	sync.RWMutex
	m map[string]gen.Bom
}

func (s *safeKnownArticles) Store(key string, value gen.Bom) {
	s.Lock()
	defer s.Unlock()
	s.m[key] = value
}

func (s *safeKnownArticles) Load(key string) (gen.Bom, bool) {
	s.RLock()
	defer s.RUnlock()
	val, ok := s.m[key]
	return val, ok
}

func getEntry(config config.AppConfig, number string) ([]entry, error) {
	path, err := fshelper.GetFilePathWithSubstring(config, number, config.STLFolder)
	if err != nil {
		return nil, err
	}

	files, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}
	result := make([]entry, 0)
	for _, fi := range files {
		if fi.IsDir() || filepath.Ext(fi.Name()) != ".txt" {
			continue
		}

		fshelper.ReadCsv(filepath.Join(path, fi.Name()), func(s []string) {
			result = append(result, entry{
				Index:  s[0],
				Name:   s[3],
				Number: s[1],
			})
		})
		return result, nil

	}
	return nil, fmt.Errorf("no stl file found for article %v", number)
}

func getBomRecursive(config config.AppConfig, current entry, knownArticles *safeKnownArticles, parents []string) (gen.Bom, error) {
	if slices.Contains(parents, current.Number) {
		errorName := "Artikel ist in sich selbst verschachtelt"
		return gen.Bom{
			Number: &current.Number,
			Name:   &errorName,
		}, nil
	}

	if bom, exists := knownArticles.Load(current.Number); exists {
		return bom, nil
	}

	children, err := getEntry(config, current.Number)
	if err != nil {
		converted := gen.Bom{
			Index:  &current.Index,
			Number: &current.Number,
			Name:   &current.Name,
		}
		knownArticles.Store(current.Number, converted)
		return converted, nil
	}

	var wg sync.WaitGroup
	childrenList := make([]gen.Bom, len(children))
	errChan := make(chan error, len(children))
	for i, child := range children {
		wg.Add(1)
		go func(idx int, c entry) {
			defer wg.Done()
			childBom, err := getBomRecursive(config, c, knownArticles, append(parents, current.Number))
			if err != nil {
				errChan <- err
				return
			}
			childrenList[idx] = childBom
		}(i, child)
	}

	// Wait for all goroutines to complete
	wg.Wait()
	close(errChan)

	// Check for errors
	if len(errChan) > 0 {
		log.Println(<-errChan)
		converted := gen.Bom{
			Index:  &current.Index,
			Number: &current.Number,
			Name:   &current.Name,
		}
		knownArticles.Store(current.Number, converted)
		return converted, nil
	}

	converted := gen.Bom{
		Index:    &current.Index,
		Number:   &current.Number,
		Name:     &current.Name,
		Children: &childrenList,
	}
	knownArticles.Store(current.Number, converted)
	return converted, nil
}

func GetBom(config config.AppConfig, number string) (gen.Bom, error) {
	root := entry{
		Number: number,
	}
	knownArticles := &safeKnownArticles{
		m: make(map[string]gen.Bom),
	}
	parent := make([]string, 0)

	result, err := getBomRecursive(config, root, knownArticles, parent)
	if err != nil {
		return gen.Bom{}, err
	}

	return result, nil

}
