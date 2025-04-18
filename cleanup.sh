#!/bin/bash

BASE_DIR="./src"

if [ -d "$BASE_DIR" ]; then
  echo "Scanning and deleting .js files in: $BASE_DIR"
  find "$BASE_DIR" -type f -name "*.js" -exec rm -v {} \;
  echo "Done."
else
  echo "Directory '$BASE_DIR' does not exist."
fi
