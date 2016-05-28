## Want to get started quickly?
- [Run application in Docker](Docker.md).

## Install requirements
You need Node.

- `node -v` should be >= 5
- `npm -v` should be >= 3

## Installation
- `npm install`
- `npm rebuild node-sass`

### :warning: What if 'npm install' fails?
- Ensure you have npm3 installed: `sudo npm install -g npm@3`
- Clear npm cache: `npm cache clean`
- remove node_modules: `rm -rf node_modules`
- Try again: `npm install`

## Start development version

- OSX / Linux: `npm run dev`
- Windows: `npm run dev-win-national`
- open: http://localhost:8080

## Start production version
- First run: `npm run build`, then run: `npm run start`
- open: http://localhost:8080

Note: on Windows, add "win-" prefix to the run commands above. For example: `npm run win-build`.
The same applies to other npm run commands below.

## Analyse webpack bundle
- run: `webpack -p --json > digitransit.json`
- Upload `digitransit.json` to `http://webpack.github.io/analyse/`

Or you can also use this:
- https://github.com/robertknight/webpack-bundle-size-analyzer

## Configure Git Hooks
You should configure git pre-commit hook to run tests and lint. That can be done like so:
- `ln -s ../../hooks/pre-commit.sh .git/hooks/pre-commit`
- `ln -s ../../hooks/pre-push.sh .git/hooks/pre-push`

## Configuration application
Digitransit ui can be configured in multiple ways. You can
- Change between National and Regional versions using CONFIG parameter
- Switch API backend using API_URL parameter
- Enable Sentry client side error monitoring using SENTRY_* parameters

Note that you can combine multiple configuration parameters.

### Changing National/Regional version (optional)
Start national version
- `npm run build`
- `npm run start`

Start HSL version
- `npm run build`
- `CONFIG=hsl npm run start`

### Changing url for OpenTripPlanner and Geocoding (optional)
By default digitransit-ui uses services from https://api.digitransit.fi but you can override API server like so:
- `npm run build`
- `API_URL=https://dev-api.digitransit.fi npm run start`

### Using Sentry to track client errors (optional)
Sentry can be configured like so:
- `npm run build`
- `SENTRY_DSN=https://xxxxx@app.getsentry.com/zzzzz SENTRY_SECRET_DSN=https://xxxx:yyyy@app.getsentry.com/zzzzz npm run start`
