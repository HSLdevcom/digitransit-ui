# openjourneyplanner-ui
Open Journey Planner UI

# Install requirements
- Install Node.js and NPM
  (if you are on Debian, the distribution version is likely too old -
  in case of problems try https://deb.nodesource.com)
- npm install

# Start dev server (with hot code reloading)
- npm run dev
- Browse to http://localhost:8080/

# Build release version and start production server
- npm run build
- npm run start

# Running webdriver ui tests

## Local - Phantomjs
- sudo npm install -g phantomjs
- Run development enviroment as described above
- Run "phantomjs --webdriver=4444"
- Run "./run-ui-tests.sh local"

## Saucelabs 
- Ensure you have saucelabs account with apikey
- Run "./run-ui-tests.sh saucelabs". This will tell you to create 'credentials.json' file. Create it.
- Run "./run-ui-tests.sh saucelabs"
