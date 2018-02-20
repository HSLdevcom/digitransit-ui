#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

if [ -z "$BS_ACCESS_KEY" ]; then
    echo "BS_ACCESS_KEY not set, failing build on purpose"
    exit 1
fi

set -e

yarn install
yarn lint
yarn build

#number of latest test results stored in dropbox - 2
GENERATIONS=10

openssl aes-256-cbc -K $encrypted_59b1a6418079_key -iv $encrypted_59b1a6418079_iv -in test/.dropbox_uploader.enc -out test/.dropbox_uploader -d

export TZ=Europe/Helsinki

CONFIG=hsl yarn start &

name=gemini-report-${VISUAL}
gzname=${name}.tar.gz

set +e
IDENTIFIER=${TRAVIS_COMMIT}_${VISUAL} yarn test-visual --browser $VISUAL
RESULT=$?
if [ $RESULT -ne 0 ]; then
    tar czf $gzname gemini-report

    #rename older generations
    for ((i=GENERATIONS; i>=1; i--))
    do
        ./test/dropbox_uploader.sh move "/${name}_${i}.tar.gz" "/${name}_$((i + 1)).tar.gz" &>/dev/null
    done
    ./test/dropbox_uploader.sh move "/$gzname" "/${name}_1.tar.gz" &>/dev/null

    echo "Uploading test images to https://www.dropbox.com/sh/852iliz0d179lnw/AADiEE7A6B6YZRdBpZzaWhhpa?dl=0 as" $gzname
    ./test/dropbox_uploader.sh upload $gzname /$gzname
fi
exit $RESULT
