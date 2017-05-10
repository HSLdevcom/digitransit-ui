#!/bin/bash
# Run flow tests on CI

# Enable for debugging
# set -e
# set -x

SELENIUM_BINARY="./test/flow/binaries/selenium-server-standalone-2.53.0.jar"
SELENIUM_URL="https://selenium-release.storage.googleapis.com/2.53/selenium-server-standalone-2.53.0.jar"
FIREFOX_BINARY="firefox/firefox-bin"
FIREFOX_URL="https://download-installer.cdn.mozilla.net/pub/firefox/releases/45.4.0esr/linux-x86_64/fi/firefox-45.4.0esr.tar.bz2"

NIGHTWATCH_BINARY="./node_modules/nightwatch/bin/nightwatch"

# checks for dependencies and downloads them if needed
function checkDependencies() {
  echo "Checking dependencies"
  mkdir -p ./test/flow/binaries
  if [ ! -f $SELENIUM_BINARY ]; then
    echo "Downloading Selenium..."
    curl -o $SELENIUM_BINARY $SELENIUM_URL
  fi

  ##ff
  if [ -z "$NOFIREFOX" ]; then
    if [ ! -f $FIREFOX_BINARY ]; then
      echo "Downloading Firefox..."
      curl -o firefox-45.4.0esr.tar.bz2 $FIREFOX_URL
      tar xjf firefox-45.4.0esr.tar.bz2
    fi
  fi
}

echo "Running flow-tests"
echo "***************************"

if [ -z "$NWENV" ]; then
  NWENV="chromedriver"
fi

if [ -z "$CHROMEDRIVER" ]; then CHROMEDRIVER="chromedriver"; fi

checkDependencies

echo "Starting chromedriver '$CHROMEDRIVER'"
DBUS_SESSION_BUS_ADDRESS=/dev/null CHROMEDRIVER_VERSION=2.24 $CHROMEDRIVER --verbose --log-path=chromedriver.log &
DRIVER_PID=$!
sleep 4

echo "Running tests NWENV=$NWENV"
$NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e $NWENV --retries 3
TESTSTATUS=$?
echo "Done"

kill -HUP $DRIVER_PID

echo "Exiting with status $TESTSTATUS"
ps aux


exit $TESTSTATUS
