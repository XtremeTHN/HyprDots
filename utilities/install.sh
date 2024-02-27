#!/bin/bash

UTILITIES_PATH=$HOME/.local/share/DotsUtilities

echo :: Moving utilities to $UTILITIES_PATH
mkdir -p $UTILITIES_PATH

ln -s $(/usr/bin/ls -d */) $UTILITIES_PATH
