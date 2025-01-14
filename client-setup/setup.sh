#!/bin/bash
HOSTNAME=$1

sudo echo "@lxpanel --profile LXDE-pi" > /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@pcmanfm --desktop --profile LXDE-pi" >> /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@xscreensaver -no-splash" >> /etc/xdg/lxsession/LXDE-pi/autostart

sudo echo "@xset s off" >> /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@xset -dpms" >> /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@xset s noblank" >> /etc/xdg/lxsession/LXDE-pi/autostart
sudo echo "@chromium-browser --kiosk $HOSTNAME" >> /etc/xdg/lxsession/LXDE-pi/autostart	