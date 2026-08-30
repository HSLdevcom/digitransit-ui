## Want to get started quickly?
- [Run application in Docker](Docker.md).

## Install requirements

You need [Node](https://nodejs.org/) and [Yarn](https://yarnpkg.com) (or npm).

- `node -v` should be >= 24.14.1
  - We recommend that you use [`nvm`](https://github.com/nvm-sh/nvm) to install a specific Node.js version. Optionally, you can also set up [its automatic version switching shell integration](https://github.com/nvm-sh/nvm/tree/e6fa80cb6178ff4e9735265281b5eae811f05f11#deeper-shell-integration).
- `yarn --version` should be the in-tree `4.13.0` version. See instructions on how to use it on your OS. For example, you might need to run: `corepack enable`.

You also need a C compiler:
- Linux: GCC 4.6 or later
- OS X: Xcode 5.0 or later

### WSL
To use Windows Subsystem for Linux in digitransit-ui development you may need to do at least the following
1. Add the following to your `/etc/hosts`. This is because the project uses ipv6 compliant `::1` instead of ipv4 style `0.0.0.0`:
```
::1     ip6-localhost ip6-loopback localhost
```
2. Add the following to your `/etc/wsl.conf` if not yet present. This prevents WSL from regenerating the `/etc/hosts` as well as the `/etc/resolv.conf`:
```
[network]
generateResolvConf=false
generateHosts = false
```

## Installation
- `yarn install && yarn setup`

## Start development version

- OSX / Linux: `yarn run dev`
- open: http://localhost:8080

## Start production version
- First run: `yarn run build`, then run: `yarn run start`
- open: http://localhost:8080

## Modifying sub-modules and components

After you have changed the files in `digitransit-components` you have to re-run `yarn setup` to build those modules
and apply the changes.

## Analyse the bundle
The client is built with [Vite](https://vitejs.dev/). To inspect chunk sizes, add
[`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) to `vite.config.mjs`
`plugins` and run `CONFIG=hsl yarn build` — it writes a treemap report you can open in a browser.

## Using Git Hooks
Husky (npm-package) is used for setting up the git hooks (`.git/hooks/`) that will allow custom scripts to be run on the repository.
Look up 'husky' in `package.json` to see the details.

## Configuration application
Digitransit ui can be configured in multiple ways. You can
- Change between National and Regional versions using `CONFIG` parameter
  - Alternatively, use `BASE_CONFIG` if server is supposed to serve multiple configurations which have same base configuration. It is used server side at start up and request's host specific config based on `host` or `x-forwarded-host` header is merged into it before returning config to client.
- Switch API backend using `API_URL` parameter

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
- `GEOCODING_BASE_URL=https://api.digitransit.fi/geocoding/v1 OTP_URL=https://api.digitransit.fi/routing/v2/finland/ yarn run start`

### Configuring static message URL with env variable
- `STATIC_MESSAGE_URL=https://dev-yleisviesti.digitransit.fi yarn run start`
