#!/bin/bash

clear
echo "Running Tests"
echo "***************************"

MOCHA_CMD=./node_modules/mocha/bin/mocha
PHANTOMJS=./node_modules/phantomjs/bin/phantomjs

killtree() {
    local _pid=$1
    kill -stop ${_pid} # needed to stop quickly forking parent from producing children between child killing and parent killing
    for _child in $(ps -o pid --no-headers --ppid ${_pid}); do
        killtree ${_child}
    done
    kill -TERM ${_pid}
}

if [ "$1" == "local" ]; then
  npm run dev &
  NODE_PID=$!
  $PHANTOMJS --webdriver=4444 &
  PHANTOMJS_PID=$!
  sleep 10 # Wait for the server to start
  TIMEOUT=10000 \
  DRIVER='local' \
  BASE_URL='http://localhost:8080' \
  $MOCHA_CMD -t 0 -R spec --compilers coffee:coffee-script/register test/*/*-spec.coffee
  EXIT=$?
  killtree $NODE_PID
  killtree $PHANTOMJS_PID
  exit $EXIT
elif [ "$1" == "saucelabs" ]; then

  if [ ! -f ./test/credentials.json ]; then
    echo "cannot find 'test/credentials.json' file."
    echo "This file will not be committed to Git, you must create it."
    echo "Format is:"
    echo '{'
    echo '  "saucelabs": {'
    echo '    "username": "your-username-here",'
    echo '    "apikey": "your-apikey-here"'
    echo '  }'
    echo '}'
    exit
  fi

  # https://saucelabs.com/platforms/
  TIMEOUT=10000 \
  DRIVER='saucelabs' \
  BASE_URL='http://matka.hsl.fi/openjourneyplanner-ui' \
  BROWSER='chrome' \
  PLATFORM='Windows 2012' \
  $MOCHA_CMD -t 0 -R spec --compilers coffee:coffee-script/register test/*/*-spec.coffee
else
  echo "Please specify environment. 'local' or 'saucelabs'"
fi  
