#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

set -e
ORG=${ORG:-hsldevcom}
yarn install

if [ -n "$BS_ACCESS_KEY" ]; then
    docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
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
