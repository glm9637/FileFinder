package config

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

const APP_NAME = "APP_NAME"
const PATH_ENV = "ROOT_PATH"
const FILES_ENV = "ALLOWED_FILES"
const FOLDERS_ENV = "ALLOWED_FOLDERS"
const PORT_ENV = "PORT"
const UPLOAD_FOLDER = "UPLOAD_FOLDER"
const UPLOAD_TO_ARTICLE_FOLDER = "UPLOAD_TO_ARTICLE_FOLDER"
const STL_FOLDER_ENV = "STL_FOLDER"

type Config struct {
	Server ServerConfig
	App    AppConfig
}
type ServerConfig struct {
	Hostname string
	Port     string
	AppName  string
}

type AppConfig struct {
	Path                  string
	Files                 []string
	Folders               []string
	UploadFolder          string
	UploadToArticleFolder string
	STLFolder             string
}

func (c *Config) Print() {
	log.Printf("Dateisuche erreichbar unter 'http://%s:%s'\n", c.Server.Hostname, c.Server.Port)
	log.Printf("Anwendung wird mit dem Titel '%s' ausgeführt", c.Server.AppName)
	log.Printf("Dateien werden in dem Pfad '%s' gesucht\n", c.App.Path)
	log.Printf("Es werden Dateien mit den endungen '%s' gesucht\n", c.App.Files)
	log.Printf("Es werden Dateien in den Unterordnern '%s' gesucht\n", c.App.Folders)
	if c.App.UploadToArticleFolder == "1" {
		log.Printf("Fotos werden in der zugehörigen Artikelordner gespeichert\n")
	}
	log.Printf("Fotos werden in dem Pfad '%s' gespeichert\n", c.App.UploadFolder)
	log.Printf("STL Dateien werden im Unterordner '%s' gesucht", c.App.STLFolder)
}

func GetConfig() (Config, error) {
	err := loadEnvFile()
	if err != nil {
		log.Println("Error while resolving the hostname")
		return Config{}, err
	}
	hostname, err := os.Hostname()
	if err != nil {

		log.Println("Error while loading the .env file")
		return Config{}, err
	}
	stlFolder := os.Getenv(STL_FOLDER_ENV)
	if stlFolder == "" {
		stlFolder = filepath.Join("STAMM", "STL")
	}
	appName := os.Getenv(APP_NAME)
	if appName == "" {
		appName = "Dateisuche"
	}
	return Config{
		Server: ServerConfig{
			Hostname: hostname,
			Port:     os.Getenv(PORT_ENV),
			AppName:  appName,
		},
		App: AppConfig{
			Path:                  os.Getenv(PATH_ENV),
			Files:                 strings.Split(os.Getenv(FILES_ENV), ","),
			Folders:               strings.Split(os.Getenv(FOLDERS_ENV), ","),
			UploadFolder:          os.Getenv(UPLOAD_FOLDER),
			UploadToArticleFolder: os.Getenv(UPLOAD_TO_ARTICLE_FOLDER),
			STLFolder:             stlFolder,
		},
	}, nil
}

func loadEnvFile() error {
	err := godotenv.Load(".env")
	return err
}
