#!/bin/bash
# Run flow tests on CI

# Enable for debugging
# set -e
# set -x

SELENIUM_BINARY="./test/flow/binaries/selenium-server-standalone-3.9.1.jar"
SELENIUM_URL="https://selenium-release.storage.googleapis.com/3.9/selenium-server-standalone-3.9.1.jar"
FIREFOX_BINARY="firefox/firefox-bin"
FIREFOX_URL="https://download-installer.cdn.mozilla.net/pub/firefox/releases/45.4.0esr/linux-x86_64/fi/firefox-45.4.0esr.tar.bz2"

NIGHTWATCH_BINARY="./node_modules/nightwatch/bin/nightwatch"

# checks for dependencies and downloads them if needed
function checkDependencies() {
  echo "Checking dependencies"
  mkdir -p ./test/flow/binaries
  if [ ! -f $SELENIUM_BINARY ]; then
    echo "Downloading Selenium..."
    curl -o $SELENIUM_BINARY $SELENIUM_URL
  fi
}

echo "Running flow-tests"
echo "***************************"

if [ -z "$NWENV" ]; then
  NWENV="chromedriver"
fi

if [ -z "$CHROMEDRIVER" ]; then CHROMEDRIVER="chromedriver"; fi

checkDependencies

echo "Starting chromedriver '$CHROMEDRIVER'"
DBUS_SESSION_BUS_ADDRESS=/dev/null CHROMEDRIVER_VERSION=2.36 $CHROMEDRIVER --verbose --log-path=chromedriver.log &
DRIVER_PID=$!
sleep 3

echo "Running tests NWENV=$NWENV"
$NIGHTWATCH_BINARY -c ./test/flow/nightwatch.json -e $NWENV --retries 3
TESTSTATUS=$?
echo "Done"

kill -HUP $DRIVER_PID

RESULT=$?
echo "run-flow-tests.sh status is $RESULT"
if [ $TESTSTATUS -ne 0 ]; then
    name=flow-test-images
    gzname=${name}.tar.gz
    tar czf $gzname test_output

    #rename older generations
    GENERATIONS=10
    for ((i=GENERATIONS; i>=1; i--))
    do
        ./test/dropbox_uploader.sh move "/${name}_${i}.tar.gz" "/${name}_$((i + 1)).tar.gz" &>/dev/null
    done
    ./test/dropbox_uploader.sh move "/$gzname" "/${name}_1.tar.gz" &>/dev/null

    echo "Uploading flow failure images to https://www.dropbox.com/sh/852iliz0d179lnw/AADiEE7A6B6YZRdBpZzaWhhpa?dl=0 as" $gzname
    ./test/dropbox_uploader.sh upload $gzname /$gzname
fi

echo "Exiting with status $TESTSTATUS"

exit $TESTSTATUS
