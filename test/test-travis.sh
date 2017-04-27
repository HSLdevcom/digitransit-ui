#/bin/bash

if [ -n "$VISUAL" ]; then
  yarn install
  yarn run test-visual -- --browser $VISUAL
  exit $?
fi

if [ -n "$NWENV" ]; then
  wget -N http://chromedriver.storage.googleapis.com/2.10/chromedriver_linux64.zip
  unzip chromedriver_linux64.zip
  NOSERVER=1 CHROMEDRIVER=./chromedriver test/flow/script/run-snap-tests.sh
  exit $?
fi

if [ -n "$LINT" ]; then
  yarn run lint
  exit $?
fi
