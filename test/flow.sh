#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

set -e

Xvfb :99 &
export DISPLAY=:99.0

yarn install
yarn lint
yarn test-local
