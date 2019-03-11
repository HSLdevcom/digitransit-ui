#!/bin/bash

# Enable for debugging
# set -e
# set -x

clear
echo "Running ui-tests: $1"
echo "***************************"

# Check if build name is set, if not this is probably a local build for user.
# This makes it easier to find current build from BrowserStack
USER=`whoami`
if [ -z "$BROWSERSTACK_BUILD" ]; then
  export BROWSERSTACK_BUILD="Local build for $USER"
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
  kill -9 $1
}


checkDependencies

if [ "$1" == "smoke" ]; then
    # extract all configuration values
    mapfile -t configs < <( ls -1 app/configurations/config.*.js | rev | cut -d '/' -f1 | rev | sed -e "s/^config.//" -e "s/.js$//" )
    TARGETS=${TARGETS:-bs-ie,bs-chrome,bs-fx,bs-edge}
fi


if [ "$1" == "local" ]; then
  if [ "$2" == "noserver" ]; then
    echo "Not starting local server."
    START_SERVER=0
  else
    echo "Starting local server."
    START_SERVER=1
    yarn build; CONFIG=hsl PORT=8080 yarn start &
    NODE_PID=$!
    echo "Wait for the server to start"
    sleep 3
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
    echo "usage: yarn test-browserstack -- BROWSERSTACK_USERNAME BROWSERSTACK_KEY [noserver]"
    exit
  fi

  if [ "$4" == "noserver" ]; then
    echo "Not starting local server."
    START_SERVER=0
  elif [ "$1" == "browserstack" ]; then
    echo "Starting local server."
    START_SERVER=1
    yarn build; CONFIG=hsl PORT=8080 yarn start &
    NODE_PID=$!
    sleep 3
  else #smoke
    yarn build  > /dev/null
  fi

  echo "launching $BROWSERSTACK_LOCAL_BINARY"
  export BROWSERSTACK_ID="$USER$(($(date +%s%N) % 1000000))"
  $BROWSERSTACK_LOCAL_BINARY --key $3 &
  BROWSERSTACK_PID=$!
  sleep 5

  if [ "$1" == "browserstack" ] ; then
     env BROWSERSTACK_USER=$2 BROWSERSTACK_KEY=$3 $NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e bs-fx,bs-chrome --suiteRetries 3
     TESTSTATUS=$?
  else
     count=${#configs[@]}
     TOTALSTATUS=0
     RETRY_SMOKE_COUNT=3

     if [ "$SMOKE" == "1" ]; then
         i1=0
         i2=$((count / 4 - 1))
     elif [ "$SMOKE" == "2" ]; then
         i1=$((count / 4))
         i2=$((count / 2 - 1))
     elif [ "$SMOKE" == "3" ]; then
         i1=$((count / 2))
         i2=$((count * 3 / 4 - 1))
     elif [ "$SMOKE" == "4" ]; then
         i1=$((count * 3 / 4))
         i2=$((count-1))
     else
         i1=0
         i2=$((count-1))
     fi

     echo "Test range $i1 - $i2"
     for i in $(seq $i1 $i2)
     do
         conf=${configs[$i]}
         echo ""
         echo "============================="
         echo "  Smoke testing $conf"
         echo "============================="
         CONFIG=$conf PORT=8080 NODE_ENV=production node server/server.js &
         NODE_PID=$!
         echo "server runs as process $NODE_PID"
         sleep 3
         export BROWSERSTACK_BUILD="$BROWSERSTACK_ID$conf"
         env BROWSERSTACK_USER=$2 BROWSERSTACK_KEY=$3 $NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e $TARGETS --suiteRetries 3 test/flow/tests/smoke/smoke.js
         TESTSTATUS=$?

         killtree $NODE_PID
         sleep 1
         if [[ $TESTSTATUS != 0 ]]; then TOTALSTATUS=$TESTSTATUS; fi
     done
     TESTSTATUS=$TOTALSTATUS
  fi
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
    echo "usage: yarn test-saucelabs -- SAUCELABS_USER SAUCELABS_KEY [noserver]"
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
    yarn build; CONFIG=hsl PORT=8080 yarn start &
    NODE_PID=$!
  fi

  # Wait for the server to start
  sleep 3
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
