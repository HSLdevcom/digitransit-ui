#/bin/bash
yarn install

if [ -n "$VISUAL" ]; then
  docker build -t hsldevcom/digitransit-ui:$TRAVIS_COMMIT .
  docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 hsldevcom/digitransit-ui:$TRAVIS_COMMIT
  yarn run test-visual -- --browser $VISUAL
  exit $?
fi

if [ -n "$NWENV" ]; then
  docker build -t hsldevcom/digitransit-ui:$TRAVIS_COMMIT .
  docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 hsldevcom/digitransit-ui:$TRAVIS_COMMIT
  wget -N http://chromedriver.storage.googleapis.com/2.10/chromedriver_linux64.zip
  unzip chromedriver_linux64.zip
  NOSERVER=1 CHROMEDRIVER=./chromedriver test/flow/script/run-snap-tests.sh
  exit $?
fi

if [ -n "$LINT" ]; then
  yarn run lint
  exit $?
fi
