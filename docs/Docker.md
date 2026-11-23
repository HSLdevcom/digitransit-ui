# Docker

The `Dockerfile` has two stages:
- **builder** installs the dependencies and builds the packages and the app.
- **runtime** contains the built app and its production dependencies only.

The image serves on port 8080 and has a health check on `/`.

## Run a published image

```sh
docker run -p 8080:8080 hsldevcom/digitransit-ui:v3
```

Then open http://localhost:8080.

- Without `CONFIG`, the server picks the config by the request's host name (`themeMap` in
  `src/server/configs/config.default.js`), so `localhost` gets the white-label `default` config.
- Add `-e CONFIG=hsl` to serve one region's config regardless of the host.

Tags, pushed by CI:
- **Branch tags:** `v3`, `next` and `hotfix` point to the latest build of that branch.
- **Single builds:** each build also gets a permanent `<branch>-<timestamp>-<commit>` tag.
- **Releases:** `v3-prod` (plus a timestamped variant) points to the image of the latest release.

## Build an image

```sh
docker build -t digitransit-ui .
```

This needs BuildKit, which is the default in Docker 23 and later. Build arguments:
- **`--build-arg CONFIG=<name>`** builds assets for that config only. The build is faster, but the
  image then serves only that config.
- **`--build-arg WEBPACK_DEVTOOL=<devtool>`** sets webpack's source map type (default `source-map`);
  `false` builds no source maps.

`.dockerignore` is an allow-list. If the build needs a new file or directory, add a `!path` line for it.

## Environment variables

Set these with `-e NAME=value` when running the image.

| Variable | Use |
| --- | --- |
| `CONFIG` | Config to serve. Empty: chosen by host name. |
| `BASE_CONFIG` | Config to merge the served config onto, instead of `default`. Also served when `CONFIG` is empty and no host matches. |
| `RUN_ENV` | `development` makes the server use development backends. Anything else, or empty, means production. |
| `PORT` | Port the server listens on, default `8080`. |
| `API_URL` | Base URL of the Digitransit APIs, default `https://dev-api.digitransit.fi`. |
| `OTP_URL` | OpenTripPlanner URL, default derived from `API_URL` and the config. |
| `GEOCODING_BASE_URL` | Geocoding API URL, default `${API_URL}/geocoding/v1`. |
| `MAP_URL` | Base URL of the map tiles, default `https://dev-cdn.digitransit.fi`. |
| `ASSET_URL` | URL prefix for the built assets, e.g. a CDN. Empty: served by the app. |
| `STATIC_MESSAGE_URL` | URL of the static messages (`matka` config only). |
| `API_SUBSCRIPTION_TOKEN` | API subscription key sent with API requests. |
| `API_SUBSCRIPTION_HEADER_NAME`, `API_SUBSCRIPTION_QUERY_PARAMETER_NAME` | Header and query parameter names for the key. |
| `NODE_OPTS` | Node.js command-line options, default `--title=digitransit-ui`. |

`src/server/configs/` reads more variables for specific features. Search it for `process.env`.

## CI

`.github/workflows/dev-pipeline.yml` runs on every push to `v3`, `next` or `hotfix`. It:
1. builds the image;
2. runs `.github/workflows/scripts/docker_smoke_test.sh`, which checks that the front page loads and
   that missing assets return 404;
3. pushes the branch and timestamped tags.

Publishing a GitHub release runs `.github/workflows/prod-pipeline.yml`, which re-tags the release
branch's image as `v3-prod`.
