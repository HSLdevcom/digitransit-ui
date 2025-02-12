## Digitransit-ui on Docker
You can run Digitransit-ui in docker. This is probably the easiest way to see the application running.

## Prerequisites
- Docker 1.9
- On Mac and Windows use [Docker toolbox](https://www.docker.com/docker-toolbox)

## Run latest national white label version for testing
- `docker run -p 8080:8080 hsldevcom/digitransit-ui`

## Run latest HSL version for testing
- `docker run -p 8080:8080 -e CONFIG=hsl hsldevcom/digitransit-ui`

## Access running application
On Linux:
- open `http://localhost:8080`

On Mac:
- run `docker-machine env default`
- see IP of `DOCKER_HOST`
- open `http://[DOCKER_HOST]:8080`

On Windows:
- open `http://localhost:8080`

## Running in production
You must use following additional variables:
- `-e CONFIG=<..>`
- `-e NODE_ENV=production`

There are also optional variables:
- `-e API_URL=<..>`
- `-e MAP_URL=<..>`
- `-e OTP_URL=<..>`
- `-e GEOCODING_BASE_URL=<..>`
- `-e ASSET_URL=<..>`
- `-e STATIC_MESSAGE_URL=<..>`
- `-e RELAY_FETCH_TIMEOUT=<..>`
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
