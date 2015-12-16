#!/bin/bash

# Enable for debugging
# set -e
# set -x

clear
echo "Running ui-tests: $1"
echo "***************************"

# Check if build name is set, if not this is probably a local build for user.
# This makes it easier to find current build from BrowserStack
if [ -z "$BROWSERSTACK_BUILD" ]; then
  USER=`whoami`
  export BROWSERSTACK_BUILD="Local build for $USER'"
fi


PLATFORM=`uname`
ARCHITECTURE=`arch`
if [ $PLATFORM == 'Darwin' ]; then
  SELENIUM_URL=https://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-darwin-x64.zip"
elif [ $ARCHITECTURE == 'i686' ]; then
  SELENIUM_URL=https://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-ia32.zip"
else
  SELENIUM_URL=https://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip"
fi

NIGHTWATCH_BINARY="./node_modules/nightwatch/bin/nightwatch"
BROWSERSTACK_LOCAL_BINARY="./test/binaries/BrowserStackLocal"
SELENIUM_BINARY="./test/binaries/selenium-server-standalone-2.48.2.jar"

# checks for dependencies and downloads them if needed
function checkDependencies {
  mkdir -p ./test/binaries
  if [ ! -f $SELENIUM_BINARY ]; then
    echo "Downloading Selenium..."
    curl -o $SELENIUM_BINARY $SELENIUM_URL
  fi

  if [ ! -f $BROWSERSTACK_LOCAL_BINARY ]; then
    echo "Downloading BrowserStackLocal..."
    curl -o $BROWSERSTACK_LOCAL_BINARY.zip $BROWSERSTACK_LOCAL_URL
    unzip $BROWSERSTACK_LOCAL_BINARY.zip
    mv BrowserStackLocal $BROWSERSTACK_LOCAL_BINARY
  fi
}

# Kills process tree
killtree() {
  local _pid=$1
  kill -stop ${_pid} # needed to stop quickly forking parent from producing children between child killing and parent killing
  for _child in $(pgrep -P ${_pid}); do
    killtree ${_child}
  done
  kill -TERM ${_pid}
}

checkDependencies

if [ "$1" == "local" ]; then
  CONFIG=hsl PORT=8000 npm run dev-nowatch &
  NODE_PID=$!
  # Wait for the server to start
  sleep 10
  # Then run tests
  $NIGHTWATCH_BINARY -c ./test/config/nightwatch.json
  TESTSTATUS=$?

  # Kill Node
  killtree $NODE_PID
  exit $TESTSTATUS
elif [ "$1" == "browserstack" ]; then
  if [ "$#" -ne 3 ]; then
    echo "ERROR: You need to use BrowserStack Username and API key as parameters"
    echo "usage: npm run test-browserstack -- BROWSERSTACK_USERNAME BROWSERSTACK_KEY"
    exit
  fi
  CONFIG=hsl PORT=8000 npm run dev-nowatch &
  NODE_PID=$!
  $BROWSERSTACK_LOCAL_BINARY $3 &
  BROWSERSTACK_PID=$!
  # Wait for the server to start
  sleep 10
  # Then run tests
  env BROWSERSTACK_USER=$2 BROWSERSTACK_KEY=$3 $NIGHTWATCH_BINARY -c ./test/config/nightwatch.json -e bs-fx,bs-chrome,bs-iphone,bs-ie
  TESTSTATUS=$?
  # Kill Node and Browserstack tunnel
  killtree $NODE_PID
  killtree $BROWSERSTACK_PID
  exit $TESTSTATUS
else
  echo "Please specify environment. 'local' or 'browserstack'"
fi
