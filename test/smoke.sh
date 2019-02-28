#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

yarn test-smoke BS_USERNAME BS_ACCESS_KEY
