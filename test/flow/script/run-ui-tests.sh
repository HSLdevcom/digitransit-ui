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

if command -v arch > /dev/null 2>&1
then
  ARCHITECTURE=`arch`
  echo "Detected architecture $ARCHITECTURE"
else
  echo "Command 'arch' does not exist. Setting empty value."
  ARCHITECTURE=''
fi

SELENIUM_URL="https://selenium-release.storage.googleapis.com/2.53/selenium-server-standalone-2.53.0.jar"

if [[ $PLATFORM == 'Darwin' ]]; then
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-darwin-x64.zip"
elif [[ $ARCHITECTURE == 'i686' ]]; then
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-ia32.zip"
else
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip"
fi

NIGHTWATCH_BINARY="./node_modules/nightwatch/bin/nightwatch"
BROWSERSTACK_LOCAL_BINARY="./test/flow/binaries/BrowserStackLocal"
SELENIUM_BINARY="./test/flow/binaries/selenium-server-standalone-2.53.0.jar"

# checks for dependencies and downloads them if needed
function checkDependencies {
  echo "Checking dependencies"
  mkdir -p ./test/flow/binaries
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
  if [ "$2" == "noserver" ]; then
    echo "Not starting local server."
    START_SERVER=0
  else
    echo "Starting local server."
    START_SERVER=1
    npm run build; CONFIG=hsl PORT=8000 npm run dev-nowatch &
    NODE_PID=$!
    echo "Wait for the server to start"
    sleep 10
  fi

  echo "Run tests"
  $NIGHTWATCH_BINARY -c ./test/flow/config/nightwatch.json
  TESTSTATUS=$?

  if [ "$START_SERVER" == "1" ]; then
    echo "Kill node with pid: $NODE_PID"
    killtree $NODE_PID
  fi
  exit $TESTSTATUS
elif [ "$1" == "browserstack" ]; then
  if [ "$#" -lt 3 ]; then
    echo "ERROR: You need to use BrowserStack Username and API key as parameters"
    echo "usage: npm run test-browserstack -- BROWSERSTACK_USERNAME BROWSERSTACK_KEY [noserver]"
    exit
  fi

  if [ "$4" == "noserver" ]; then
    echo "Not starting local server."
    START_SERVER=0
  else
    echo "Starting local server."
    START_SERVER=1
    npm run build; CONFIG=hsl PORT=8000 npm run start &
    NODE_PID=$!
  fi

  $BROWSERSTACK_LOCAL_BINARY $3 &
  BROWSERSTACK_PID=$!

  # Wait for the server to start
  sleep 10
  # Then run tests
  env BROWSERSTACK_USER=$2 BROWSERSTACK_KEY=$3 $NIGHTWATCH_BINARY -c ./test/flow/config/nightwatch.json -e bs-fx,bs-chrome,bs-ie
  TESTSTATUS=$?
  # Kill Node and Browserstack tunnel
  if [ "$START_SERVER" == "1" ]; then
    echo "Shutting down local server"
    killtree $NODE_PID
  fi

  echo "Shutting down Browserstack tunnel"
  killtree $BROWSERSTACK_PID
  exit $TESTSTATUS
else
  echo "Please specify environment. 'local' or 'browserstack'"
fi
