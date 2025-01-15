#!/bin/bash
HOSTNAME=$1

AUTOSTART_FILE="~/.config/autostart/filefinder.desktop"

mkdir -p ~/.config/autostart
touch $AUTOSTART_FILE

echo "[Desktop Entry]" > $AUTOSTART_FILE
echo "Name=FileFinder" >> $AUTOSTART_FILE
echo "Type=Application" >> $AUTOSTART_FILE
echo "Exec=chromium-browser --kiosk $HOSTNAME" >> $AUTOSTART_FILE
echo "Terminal=false" >> $AUTOSTART_FILE

