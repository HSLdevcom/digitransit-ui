#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then
    echo "*** Tagged build:" $TRAVIS_TAG
    exit 0;
fi

set -e

yarn install
yarn lint
yarn build
