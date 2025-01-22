# FileFinder

Webserver zum finden von Dateien

# Installation

Zuerst die Zip Datei des aktuellsten Releases herunterladen und extrahieren.
Anschließend die Konfigurationsparameter ind der .env Datei nach belieben anpassen.
Anwendung dateisuche.exe ausführen

# Client Konfiguration

Das Script "setup.sh" aus dem client-setup Ordner auf den Rasperry pi kopieren und wie folgt ausführen

"bash setup.sh http://[HOSTNAME]:[PORT]"

Dabei Hostname durch den Hostnamen vom Server und Port durch den Port des servers ersetzen. Nach einem Neustart wird nun automatisch Die Anwendung gestartet

# Scanner

Um den Scanner Modus zu benutzen muss der Scanner mit Enter als Ende Signal konfiguriert sein. Wenn das erfüllt ist, können Barcodes mit den folgenden Befehlen gescannt und verarbeitet werden.
| Befehl | Beschreibung |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT | Zeigt die nächste Datei an |
| PREV | Zeigt die vorherige Datei an |
| CLOSE | Schließt den aktuellen Artikel und kehrt zum Startbildschirm zurück |
| (7 Zahlen) | Öffnet den entsprechenden Artikel |

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
