#/bin/bash

if [ -z "$BS_ACCESS_KEY" ]; then
    echo "BS_ACCESS_KEY not set, failing build on purpose"
    exit 1
fi

set -e

yarn install
free -m
nproc
yarn build

#number of latest test results stored in dropbox
GENERATIONS=10
# How many times visual tests should be tried before giving up
MAX_TRIES=1

openssl aes-256-cbc -K $encrypted_59b1a6418079_key -iv $encrypted_59b1a6418079_iv -in test/.dropbox_uploader.enc -out test/.dropbox_uploader -d

export TZ=Europe/Helsinki

CONFIG=hsl yarn start &

name=gemini-report-${VISUAL}
gzname=${name}.tar.gz

set +e
while [ $MAX_TRIES -gt 0 ]; do
    IDENTIFIER=${GITHUB_SHA}_${VISUAL} yarn test-visual --browser $VISUAL
    RESULT=$?
    if [ $RESULT -eq 0 ]; then
        exit 0
    fi
    let MAX_TRIES=MAX_TRIES-1
done

if [ $RESULT -ne 0 ]; then
    tar czf $gzname gemini-report

    #rename older generations
    for ((i=GENERATIONS; i>=1; i--))
    do
        # Delete oldest file first as move doesn't want to overwrite existing file
        ./test/dropbox_uploader.sh delete "/${name}_$((i + 1)).tar.gz" &>/dev/null
        ./test/dropbox_uploader.sh move "/${name}_${i}.tar.gz" "/${name}_$((i + 1)).tar.gz" &>/dev/null
    done
    ./test/dropbox_uploader.sh move "/$gzname" "/${name}_1.tar.gz" &>/dev/null

    echo "Uploading test images to https://www.dropbox.com/sh/852iliz0d179lnw/AADiEE7A6B6YZRdBpZzaWhhpa?dl=0 as" $gzname
    ./test/dropbox_uploader.sh upload $gzname /$gzname
fi
exit $RESULT
