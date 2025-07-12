#!/bin/bash

###############################################################################
# Preparation
###############################################################################

# Output colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NO_COLOR='\033[0m'

# Stop execution if any command fails
set -e

# Debug
set -x

###############################################################################
# Execution
###############################################################################
cd backend
# Python version
echo "---------- Step 1: Ensure Python 3.10 or higher is available ----------"
target_version=3.10
python_version=$(python --version 2>&1 | awk '{print $2}')
python_major=$(echo "$python_version" | cut -d. -f1)
python_minor=$(echo "$python_version" | cut -d. -f2)

if [[ $? -ne 0 || "$python_major" -lt 3 || ( "$python_major" -eq 3 && "$python_minor" -lt 10 ) ]]; then
    echo -e "${RED}[Failed] Python 3.10 or higher not found${NO_COLOR}"
    exit 1
else
    echo -e "${GREEN}[Passed] Python is available${NO_COLOR}"
fi

# uv setup
echo "---------- Step 2: Ensure uv is available ----------"
python -m uv --version
if [[ $? -gt 0 ]]; then
    echo -e "${RED}[Failed] uv not installed in global Python. Start installing via pip...${NO_COLOR}"
    python -m pip install uv
else
    echo -e "${GREEN}[Passed] uv available in global Python${NO_COLOR}"
fi

# .venv
echo "---------- Step 3: Create virtual environment ----------"
rm -rf .venv
python -m uv venv .venv && source .venv/Scripts/activate 

if [[ $? -gt 0 ]]; then
    echo -e "${RED}[Failed] Fail to activate virtual environment${NO_COLOR}"
    exit 1
else
    echo -e "${GREEN}[Passed] .venv successfully activated.${NO_COLOR}"
fi

# Packages Installation
echo "---------- Step 4: Install requirements.txt ----------"

if [ -f "requirements.txt" ]; then
    python -m ensurepip && python -m pip install uv && uv pip install -r requirements.txt
else
    echo -e "${RED}[Failed] requirements.txt not found.${NO_COLOR}"
    echo -e "Creating empty .venv ..."
    python -m ensurepip && python -m pip install uv && uv --version
fi

if [[ $? -gt 0 ]]; then
    echo -e "${RED}[Failed] Fail to install needed packages provided by requirements.txt${NO_COLOR}"
    exit 1
else
    echo -e "${GREEN}[Passed] Successfully installed needed packages provided by requirements.txt${NO_COLOR}"
    echo -e "Activate one more time with ${GREEN}source .venv/Scripts/activate${NO_COLOR} and enjoy!"
fi

source .venv/Scripts/activate

cd ../frontend && npm install

ng serve &

python ../backend/main.py &

# Start the Angular application

start msedge http://127.0.0.1:5000/api/docs/
start msedge http://localhost:4200/
