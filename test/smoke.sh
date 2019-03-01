#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

wget -N http://chromedriver.storage.googleapis.com/2.38/chromedriver_linux64.zip
unzip chromedriver_linux64.zip

yarn install
CHROMEDRIVER=./chromedriver yarn test-smoke BS_USERNAME BS_ACCESS_KEY
