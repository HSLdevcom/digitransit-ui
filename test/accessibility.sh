#/bin/bash

CONFIG=hsl NO_AXE=true yarn run dev &
sleep 10 # Sleep so that server starts in time for tests

wget -N https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz
tar -xvzf geckodriver*
chmod +x geckodriver

# Enable when chrome testing works
#wget -N http://chromedriver.storage.googleapis.com/2.38/chromedriver_linux64.zip
#unzip -n chromedriver_linux64.zip
#CHROMEDRIVER=./chromedriver

echo "Starting tests..."
node ./accessibility/run-test.js

#TOdO kill UI process afterwards?