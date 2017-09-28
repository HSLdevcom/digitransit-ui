#/bin/bash
yarn install

if [ -n "$VISUAL" ]; then
  if [ -n "$BS_ACCESS_KEY" ]; then
    docker build -t hsldevcom/digitransit-ui:$TRAVIS_COMMIT .
    docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 hsldevcom/digitransit-ui:$TRAVIS_COMMIT
    IDENTIFIER=${TRAVIS_COMMIT}_${VISUAL} yarn run test-visual -- --browser $VISUAL
    RESULT=$?
    if [ $RESULT -ne 0 ]; then
      echo "Uploading test images to https://www.dropbox.com/sh/emh3x8h38egy2k1/AAAq_eLYDxJ0AJAwFffoZqH9a?dl=0"
      tar czf gemini-report-$TRAVIS_COMMIT-$VISUAL.tar.gz gemini-report
      ./test/dropbox_uploader.sh upload gemini-report-$TRAVIS_COMMIT-$VISUAL.tar.gz /gemini-report-$TRAVIS_COMMIT-$VISUAL.tar.gz
    fi
    exit $RESULT
  else
    echo "BS_ACCESS_KEY not set, failing build on purpose"
    exit 1
  fi
fi

if [ -n "$NWENV" ]; then
  docker build -t hsldevcom/digitransit-ui:ci-$TRAVIS_COMMIT .
  docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 hsldevcom/digitransit-ui:ci-$TRAVIS_COMMIT
  wget -N https://chromedriver.storage.googleapis.com/2.32/chromedriver_linux64.zip
  unzip chromedriver_linux64.zip
  CHROMEDRIVER=./chromedriver test/flow/script/run-flow-tests.sh
  RESULT=$?
  if [ $RESULT -eq 0 ]; then
    echo "Pushing to docker"
    if [[ "$TRAVIS_BRANCH" = "master" && "$TRAVIS_PULL_REQUEST" = "false" ]]; then
      docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
      docker push hsldevcom/digitransit-ui:ci-$TRAVIS_COMMIT
      docker tag hsldevcom/digitransit-ui:ci-$TRAVIS_COMMIT hsldevcom/digitransit-ui:latest
      docker push hsldevcom/digitransit-ui:latest
    fi
  fi
  exit $RESULT
fi

if [ -n "$LINT" ]; then
  yarn run lint
  exit $?
fi
