#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

set -e

export CHROME_BIN=/usr/bin/google-chrome
export DISPLAY=:99.0
/sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
sudo apt-get install -y libappindicator1 fonts-liberation
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome*.deb

ORG=${ORG:-hsldevcom}
yarn install

docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
wget -N http://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
CHROMEDRIVER=./chromedriver test/flow/script/run-flow-tests.sh
RESULT=$?
echo "run-flow-tests.sh status is $RESULT"
if [ $RESULT -ne 0 ]; then
    echo "Uploading flow failure images to https://www.dropbox.com/sh/emh3x8h38egy2k1/AAAq_eLYDxJ0AJAwFffoZqH9a?dl=0"
    tar czf flow-test-images-$TRAVIS_COMMIT.tar.gz test_output
    ./test/dropbox_uploader.sh upload flow-test-images-$TRAVIS_COMMIT.tar.gz /flow-test-images-$TRAVIS_COMMIT.tar.gz
fi
exit $RESULT
