#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

set -e

yarn install
yarn lint

sudo apt-get install -y libappindicator1 fonts-liberation

wget https://github.com/mozilla/geckodriver/releases/download/v0.20.0/geckodriver-v0.20.0-linux64.tar.gz
tar -xvzf geckodriver-v0.20.0-linux64.tar.gz

Xvfb :40 &
export DISPLAY=:40
sleep 1

yarn test-local
