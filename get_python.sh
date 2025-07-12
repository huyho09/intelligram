#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NO_COLOR='\033[0m'

target_version=$1
base_dir=~/.conda/envs

for folder in "$base_dir"/*; do
    if [ -d "$folder" ]; then
        python_exe="$folder/python.exe"

        if [ -f "$python_exe" ]; then
            python_version=$("$python_exe" --version 2>&1 | awk '{print $2}')
           
            if [[ "$python_version" == $target_version* ]]; then
                echo -e ${GREEN}$folder${NO_COLOR} has ${GREEN}$($folder/python.exe --version)${NO_COLOR}
                echo -e Execute this: ${GREEN}export PATH=\"$folder:\$PATH\"${NO_COLOR} to add the binary path to \$PATH
                exit 0
            fi
        fi
    fi
done

echo -e "${RED}No folder found with Python version $target_version.${NO_COLOR}"
exit 1