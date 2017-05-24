#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

if [ -z "$BS_ACCESS_KEY" ]; then
    echo "BS_ACCESS_KEY not set, failing build on purpose"
    exit 1
fi

set -e
ORG=${ORG:-hsldevcom}
yarn install

openssl aes-256-cbc -K $encrypted_59b1a6418079_key -iv $encrypted_59b1a6418079_iv -in test/.dropbox_uploader.enc -out test/.dropbox_uploader -d
docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 $ORG/digitransit-ui:ci-$TRAVIS_COMMIT

set +e
IDENTIFIER=${TRAVIS_COMMIT}_${VISUAL} yarn run test-visual -- --browser $VISUAL
RESULT=$?
if [ $RESULT -ne 0 ]; then
    echo "Uploading test images to https://www.dropbox.com/sh/emh3x8h38egy2k1/AAAq_eLYDxJ0AJAwFffoZqH9a?dl=0"
    tar czf gemini-report-$TRAVIS_COMMIT-$VISUAL.tar.gz gemini-report
    ./test/dropbox_uploader.sh upload gemini-report-$TRAVIS_COMMIT-$VISUAL.tar.gz /gemini-report-$TRAVIS_COMMIT-$VISUAL.tar.gz
fi
exit $RESULT
