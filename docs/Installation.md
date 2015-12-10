## Want to get started quickly?
- [Run application in Docker](Docker.md).

## Install requirements
- Install Node.js
  (if you are on Debian, the distribution version is likely too old -
  in case of problems try https://deb.nodesource.com)
- `sudo npm install -g npm@3`
- `sudo npm install -g nodemon`
- `sudo npm install -g node-sass`
- `sudo npm install -g webpack`
- `npm install`
  (you will get warnings, ignore those for now)

## :warning: What if 'npm install' fails?
- Ensure you have npm3 installed: `sudo npm install -g npm@3`
- Clear npm cache: `npm cache clean`
- remove node_modules: `rm -rf node_modules`
- Try again: `npm install`

## Start development version

- OSX / Linux: `npm run dev`
- Windows: `npm run dev-win-national`
- open: http://localhost:8080

## Start production version
- `npm run build`
- `npm run start`
- open: http://localhost:8080

## Analyse webpack bundle
- run: `webpack -p --json > digitransit.json`
- Upload `digitransit.json` to `http://webpack.github.io/analyse/`

Or you can also use this:
- https://github.com/robertknight/webpack-bundle-size-analyzer

## Configure Git Hooks
You should configure git pre-commit hook to run tests and lint. That can be done like so:
- `ln -s ../../hooks/pre-commit.sh .git/hooks/pre-commit`

## Configuration application
Digitransit ui can be configured in multiple ways. You can
- Change between National and Regional versions using CONFIG parameter
- Switch API backend using SERVER_ROOT parameter
- Enable Sentry client side error monitoring using SENTRY_* parameters

Note that you can combine multiple configuration parameters.

### Changing National/Regional version (optional)
Start national version
- `npm run build`
- `npm run start`

Start HSL version
- `CONFIG=hsl npm run build`
- `CONFIG=hsl npm run start`

### Changing url for OpenTripPlanner and Geocoding (optional)
By default digitransit-ui uses services from http://matka.hsl.fi but you can override API server like so:
- `SERVER_ROOT=http://dev.digitransit.fi npm run build`
- `npm run start`

### Using Sentry to track client errors (optional)
Sentry can be configured like so:
- `SENTRY_DSN=https://xxxxx@app.getsentry.com/zzzzz npm run build`
- `SENTRY_SECRET_DSN=https://xxxx:yyyy@app.getsentry.com/zzzzz npm run start`
