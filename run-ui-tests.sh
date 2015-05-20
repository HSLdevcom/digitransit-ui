#!/bin/bash

clear
echo "Running Tests"
echo "***************************"

if [ "$1" == "local" ]; then
  TIMEOUT=3000 \
  DRIVER='local' \
  BASE_URL='http://localhost:8080' \
  mocha -t 3000 -R spec test/front-page/*.js
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
  TIMEOUT=30000 \
  DRIVER='saucelabs' \
  BASE_URL='http://matka.hsl.fi/openjourneyplanner-ui/' \
  BROWSER='chrome' \
  PLATFORM='Windows 2012' \
  mocha -t 30000 -R spec test/front-page/*.js
else
  echo "Please specify environment. 'local' or 'saucelabs'"
fi  