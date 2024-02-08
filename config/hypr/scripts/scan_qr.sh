#!/bin/bash
SCREENSHOT_FILE="/tmp/qrimg"

slurp | grim -g - $SCREENSHOT_FILE

zbarimg -q --raw $SCREENSHOT_FILE | wl-copy
