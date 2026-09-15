## Digitransit-ui on Docker
You can run Digitransit-ui in docker. This is probably the easiest way to see the application running.

## Prerequisites
- Docker with BuildKit support (Docker 23+ recommended)

## Run latest national white label version for testing
- `docker run -p 8080:8080 hsldevcom/digitransit-ui`

## Run latest HSL version for testing
- `docker run -p 8080:8080 -e CONFIG=hsl hsldevcom/digitransit-ui`
- Runtime `-e CONFIG=<name>` only works against an image built without `--build-arg CONFIG=...`;
  a single-CONFIG build only serves that one config.

## Access running application
On Linux:
- open `http://localhost:8080`

On Mac:
- run `docker-machine env default`
- see IP of `DOCKER_HOST`
- open `http://[DOCKER_HOST]:8080`

## Running in production
You must use the following additional variable:
- `-e CONFIG=<..>`

There are also optional variables:
- `-e RUN_ENV=<development|production>` — deployment run environment (default `production`,
  server-only). Set `development` on dev/staging instances so the server picks dev backends (dev
  MQTT broker, dev stop-monitor URLs) when it assembles the config. Also surfaced to the browser
  as `window.config.RUN_ENV`.
- `-e API_URL=<..>`
- `-e MAP_URL=<..>`
- `-e OTP_URL=<..>`
- `-e GEOCODING_BASE_URL=<..>`
- `-e ASSET_URL=<..>`
- `-e STATIC_MESSAGE_URL=<..>`
- `-e NODE_OPTS=<..>`
- `-e BASE_CONFIG=true`
- `-e API_SUBSCRIPTION_QUERY_PARAMETER_NAME=<..>`
- `-e API_SUBSCRIPTION_HEADER_NAME=<..>`
- `-e API_SUBSCRIPTION_TOKEN=<..>`

## Build new snapshot image
Only Linux and Mac OS are supported.

### Build a new docker image
- `docker build -t hsldevcom/digitransit-ui .`

### Releases
- Done through automated builds in github actions triggered by github releases
