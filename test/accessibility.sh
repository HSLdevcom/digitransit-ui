#/bin/bash

GECKODRIVER_URL="https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz " 

if ! command -v firefox &> /dev/null
then
    echo "Error: Firefox could not be found in path. This script requires firefox"
    echo "To install firefox run: sudo apt install firefox or sudo apt install firefox-esr or brew install firefox depending on your OS/distribution"
    echo "If firefox is installed, try adding it to the path"
    exit
fi

# Silence output and send to background
CONFIG=hsl yarn run dev >/dev/null 2>&1 &

echo "Waiting for the Digitransit UI to start..."
# Wait until server is accepting connections
while ! echo exit | nc localhost 8080; do sleep 3; done

# Fetch required webrivers
mkdir -p binaries
wget -NP binaries $GECKODRIVER_URL
tar -xvzf binaries/geckodriver* -C binaries
chmod +x binaries/geckodriver
export PATH=$PATH:$PWD/binaries

# Enable when chrome testing works
#wget -N http://chromedriver.storage.googleapis.com/2.38/chromedriver_linux64.zip
#unzip -n chromedriver_linux64.zip
#CHROMEDRIVER=./chromedriver

echo "Starting tests..."
node ./accessibility/run-test.js

list_descendants ()
{
  local children=$(ps -o pid= --ppid "$1")

  for pid in $children
  do
    list_descendants "$pid"
  done

  echo "$children"
}

kill $(list_descendants $$)
