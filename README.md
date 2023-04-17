# FileFinder

Webserver zum finden von Dateien

# Installation

Zuerst die Zip Datei des aktuellsten Releases herunterladen und extrahieren.
Anschließend die Konfigurationsparameter ind der .env Datei nach belieben anpassen.
Anwendung dateisuche.exe ausführen

# Konfigurationsparameter

Die folgenden Parameter können in der .env Dateien konfiguriert werden

| Name                     | Beschreibung                                                                                                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ROOT_PATH                | Der Basisordner, in dem die Artikeldateistrukturen abgelegt sind                                                                                                                                                           |
| ALLOWED_FILES            | Ein mit Kommata getrennte Liste, mit allen erlaubten Dateiendungen                                                                                                                                                         |
| ALLOWED_FOLDERS          | Eine mit Kommata getrennte Liste, welche alle erlaubten Namen von Unterordnern beinhaltet                                                                                                                                  |
| PORT                     | Der zu verwendende Port, standardmäßig sollte hier die 80 eingestellt werden, es sei den dieser Port ist auf dem Server bereits belegt                                                                                     |
| UPLOAD_TO_ARTICLE_FOLDER | Wird hier eine 1 eingestellt, werden hochgeladene Dateien in dem zugehörigen Artikelordner gespeichert                                                                                                                     |
| UPLOAD_FOLDER            | Der Ordner, in dem die hochgeladenen Dateien gespeichert werden. Falls UPLOAD_TO_ARTICLE_FOLDER auf 1 gestellt wurde, reicht hier eine relative Angabe, wie zum Beispiel "bilder", ansonsten ist ein voller Pfad anzugeben |
