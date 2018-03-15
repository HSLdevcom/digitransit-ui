#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

set -e

yarn install
yarn lint

sudo apt-get install -y libappindicator1 fonts-liberation

yarn test-local
