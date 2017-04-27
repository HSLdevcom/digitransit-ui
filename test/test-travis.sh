#/bin/bash

if [ -n "$VISUAL" ]; then
  npm install --silent
  npm run test-visual -- --browser $VISUAL
  exit $?
fi

if [ -n "$NWENV" ]; then
  wget -N http://chromedriver.storage.googleapis.com/2.10/chromedriver_linux64.zip
  unzip chromedriver_linux64.zip
  CHROMEDRIVER=./chromedriver test/flow/script/run-snap-tests.sh
  exit $?
fi

if [ -n "$LINT" ]; then
  npm run lint
  exit $?
fi
