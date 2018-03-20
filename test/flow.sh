#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

openssl aes-256-cbc -K $encrypted_59b1a6418079_key -iv $encrypted_59b1a6418079_iv -in test/.dropbox_uploader.enc -out test/.dropbox_uploader -d

set -e

export CHROME_BIN=/usr/bin/google-chrome
export DISPLAY=:99.0
/sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16
sudo apt-get install -y libappindicator1 fonts-liberation
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome*.deb

yarn install
yarn build

CONFIG=hsl yarn start &

wget -N http://chromedriver.storage.googleapis.com/2.36/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
CHROMEDRIVER=./chromedriver test/flow/script/run-flow-tests.sh
