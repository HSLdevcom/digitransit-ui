#/bin/bash
set -e

cleanup() {
    kill -- -"$NODE_PID"
}

trap "exit $TESTSTATUS" INT TERM
trap cleanup EXIT

GECKODRIVER_URL="https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz"
GECKODRIVER_FILENAME=$(echo $GECKODRIVER_URL | awk -F/ '{print $NF}')

# Silence output and send to background
set -m; (
    CONFIG=hsl yarn run dev >/dev/null 2>&1 &
) & set +m; NODE_PID=$!

# Install firefox if needed
if ! [ -x "$(command -v firefox)" ]
then
    echo "Firefox could not be found, trying to install..."
    sudo apt install firefox
fi

# Fetch required webrivers
if [ ! -f ./test/binaries/$GECKODRIVER_FILENAME ]
then
    mkdir -p ./test/binaries
    wget -NP ./test/binaries $GECKODRIVER_URL
    tar --skip-old-files -xzf ./test/binaries/geckodriver-* -C ./test/binaries
    chmod +x ./test/binaries/geckodriver
fi
export PATH=$PATH:./test/binaries

echo "Waiting for the Digitransit UI to start..."
# Wait until server is accepting connections
while ! echo exit | nc localhost 8080; do sleep 3; done

# Enable when chrome testing works
#wget -N http://chromedriver.storage.googleapis.com/2.38/chromedriver_linux64.zip
#unzip -n chromedriver_linux64.zip
#CHROMEDRIVER=./chromedriver

echo "Starting tests..."
node ./test/accessibility/run-test.js "$@"
TESTSTATUS=$?

set +e
