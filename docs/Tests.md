
## Running webdriver ui tests

### Local - Phantomjs
- npm run test

### Saucelabs 
- Ensure you have saucelabs account with apikey
- Run "./run-ui-tests.sh saucelabs". This will tell you to create 'credentials.json' file. Create it.
- Run "./run-ui-tests.sh saucelabs"

### Selenium end-to-end

#### Local Firefox

- Run "wget https://selenium-release.storage.googleapis.com/2.48/selenium-server-standalone-2.48.2.jar"
- Run "npm run dev"
- Run "node_modules/nightwatch/bin/nightwatch"
- PhantomJS end-to-end tests do not currently work, but it can be run with
  "node_modules/nightwatch/bin/nightwatch -e phantom --skiptags nophantom"

#### BrowserStack
- Run "wget https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip" (on another platform check https://www.browserstack.com/local-testing)
- Run "unzip BrowserStackLocal-linux-x64.zip"
- Run "./BrowserStackLocal YOUR_BROWSERSTACK_KEY"
- Run "npm run dev"
- Run "env BROWSERSTACK_USER=YOUR_USERNAME BROWSERSTACK_KEY=YOUR_KEY node_modules/nightwatch/bin/nightwatch -e browserstack"
