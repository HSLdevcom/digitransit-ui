## Want to get started quickly?
- [Run application in Docker](Docker.md).

## Install requirements
You need Node and yarn (or npm3).

- `node -v` should be >= 8
- `yarn --version` should be >= 0.18.0 (or `npm -v` should be >= 3)

You also need a C compiler:
- Linux: GCC 4.6 or later
- OS X: Xcode 5.0 or later
- Windows: for example MSVC 2013 Express

## Installation
- `yarn install`
## Start development version

- OSX / Linux: `yarn run dev`
- Windows: `npm run dev-win-national`
- open: http://localhost:8080

## Start production version
- First run: `yarn run build`, then run: `yarn run start`
- open: http://localhost:8080

Note: on Windows, add "win-" prefix to the run commands above. For example: `npm run win-build`.
The same applies to other npm run commands below.

## Analyse webpack bundle
- run: `webpack -p --json > digitransit.json`
- Upload `digitransit.json` to `http://webpack.github.io/analyse/`

Or you can also use this:
- https://github.com/robertknight/webpack-bundle-size-analyzer

## Using Git Hooks
Husky (npm-package) is used for setting up the git hooks (`.git/hooks/`) that will allow custom scripts to be run on the repository.
Look up 'husky' in `package.json` to see the details.

## Configuration application
Digitransit ui can be configured in multiple ways. You can
- Change between National and Regional versions using `CONFIG` parameter
  - Alternatively, use `BASE_CONFIG` if server is supposed to serve multiple configurations which have same base configuration. It is used server side at start up and request's host specific config based on `host` or `x-forwarded-host` header is merged into it before returning config to client.
- Switch API backend using `API_URL` parameter
- Enable Sentry client side error monitoring using `SENTRY_*` parameters

Note that you can combine multiple configuration parameters.

### Changing National/Regional version (optional)
Start national version
- `yarn run build`
- `yarn run start`

Start HSL version
- `yarn run build`
- `CONFIG=hsl yarn run start`

### Changing urls for OpenTripPlanner, Geocoding, Service alerts and Vehicle positions (optional)
By default digitransit-ui uses services from https://dev-api.digitransit.fi but you can override API server like so:
- `yarn run build`
- `API_URL=https://api.digitransit.fi yarn run start`

If you want to specify different URL (not just base URL) for individual services, you can define variables OTP_URL, MAP_URL and/or GEOCODING_BASE_URL (URL path before /search or /reverse).
- `yarn run build`
- `GEOCODING_BASE_URL=https://api.digitransit.fi/geocoding/v1 OTP_URL=https://api.digitransit.fi/routing/v1/routers/finland/ yarn run start`

### Using Sentry to track client errors (optional)
Sentry can be configured like so:
- `yarn run build`
- `SENTRY_DSN=https://xxxxx@app.getsentry.com/zzzzz SENTRY_SECRET_DSN=https://xxxx:yyyy@app.getsentry.com/zzzzz yarn run start`

### Configuring static message URL with env variable
- `STATIC_MESSAGE_URL=https://dev-yleisviesti.digitransit.fi yarn run start`
