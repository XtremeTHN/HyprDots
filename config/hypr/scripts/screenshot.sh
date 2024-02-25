#!/bin/bash

SCREENSHOT_FILE="$(xdg-user-dir PICTURES)/$(date +%Y-%m-%d-%y-%Hh-%Mm-%Ss-Screenshot.png)"

slurp | grim -g - $SCREENSHOT_FILE

wl-copy < $SCREENSHOT_FILE

notify-send "Screenshot saved" "Screenshot saved to $SCREENSHOT_FILE" -i $SCREENSHOT_FILE
