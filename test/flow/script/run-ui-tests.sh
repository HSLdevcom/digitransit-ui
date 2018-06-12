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

SELENIUM_URL="https://selenium-release.storage.googleapis.com/3.9/selenium-server-standalone-3.9.1.jar"

if [[ $PLATFORM == 'Darwin' ]]; then
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-darwin-x64.zip"
  SAUCELABS_CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.16-osx.zip"
elif [[ $ARCHITECTURE == 'i686' ]]; then
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-ia32.zip"
  SAUCELABS_CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.16-linux32.tar.gz"
else
  BROWSERSTACK_LOCAL_URL="https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip"
  SAUCELABS_CONNECT_URL="https://saucelabs.com/downloads/sc-4.3.16-linux.tar.gz"
fi

NIGHTWATCH_BINARY="./node_modules/nightwatch/bin/nightwatch"
BROWSERSTACK_LOCAL_BINARY="./test/flow/binaries/BrowserStackLocal"
SAUCELABS_CONNECT_BINARY="./test/flow/binaries/sc"
SELENIUM_BINARY="./test/flow/binaries/selenium-server-standalone-3.9.1.jar"

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

  if [ ! -f $SAUCELABS_CONNECT_BINARY ]; then
    echo "Downloading SauceLabs Connect..."
    if [[ $PLATFORM == 'Darwin' ]]; then
      curl -o $SAUCELABS_CONNECT_BINARY.zip $SAUCELABS_CONNECT_URL
      unzip -j $SAUCELABS_CONNECT_BINARY.zip "sc-4.3.16-osx/bin/sc" -d ./test/flow/binaries
    else
      curl -o $SAUCELABS_CONNECT_BINARY.tar.gz $SAUCELABS_CONNECT_URL
      tar -v --no-anchored --strip-components=2 -x sc -f $SAUCELABS_CONNECT_BINARY.tar.gz
      mv sc $SAUCELABS_CONNECT_BINARY
    fi
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
    npm run build; CONFIG=hsl PORT=8080 npm start &
    NODE_PID=$!
    echo "Wait for the server to start"
    sleep 10
  fi

  echo "Run tests"
  $NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json
  TESTSTATUS=$?

  if [ "$START_SERVER" == "1" ]; then
    echo "Kill node with pid: $NODE_PID"
    killtree $NODE_PID
  fi
  exit $TESTSTATUS
elif [ "$1" == "browserstack" ] || [ "$1" == "smoke" ]; then
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
    npm run build; CONFIG=hsl PORT=8080 npm run start &
    NODE_PID=$!
  fi

  $BROWSERSTACK_LOCAL_BINARY $3 &
  BROWSERSTACK_PID=$!

  # Wait for the server to start
  sleep 10
  # Then run tests
  if [ "$1" == "browserstack" ] ; then
    env BROWSERSTACK_USER=$2 BROWSERSTACK_KEY=$3 $NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e bs-fx,bs-chrome --suiteRetries 3
  else
    env BROWSERSTACK_USER=$2 BROWSERSTACK_KEY=$3 $NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e bs-ie,bs-edge,bs-iphone,bs-android --tag smoke --suiteRetries 3
  fi
  TESTSTATUS=$?
  # Kill Node and Browserstack tunnel
  if [ "$START_SERVER" == "1" ]; then
    echo "Shutting down local server"
    killtree $NODE_PID
  fi

  echo "Shutting down Browserstack tunnel"
  killtree $BROWSERSTACK_PID
  exit $TESTSTATUS
elif [ "$1" == "saucelabs" ]; then
  if [ "$#" -lt 3 ]; then
    echo "ERROR: You need to use SauceLabs Username and API key as parameters"
    echo "usage: npm run test-saucelabs -- SAUCELABS_USER SAUCELABS_KEY [noserver]"
    exit
  fi

  $SAUCELABS_CONNECT_BINARY -u $2 -k $3 &
  SAUCELABS_PID=$!

  if [ "$4" == "noserver" ]; then
    echo "Not starting local server."
    START_SERVER=0
  else
    echo "Starting local server."
    START_SERVER=1
    npm run build; CONFIG=hsl PORT=8080 npm run start &
    NODE_PID=$!
  fi

  # Wait for the server to start
  sleep 10
  # Then run tests
  env SAUCELABS_USER=$2 SAUCELABS_KEY=$3 $NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e sl-iphone --retries 3
  TESTSTATUS=$?

  # Kill Node and SL tunnel
  if [ "$START_SERVER" == "1" ]; then
    echo "Shutting down local server"
    killtree $NODE_PID
  fi

  echo "Shutting down SauceLabs tunnel"
  killtree $SAUCELABS_PID
  exit $TESTSTATUS
else
  echo "Please specify environment. 'local', 'browserstack', 'smoke', or 'saucelabs'"
fi
