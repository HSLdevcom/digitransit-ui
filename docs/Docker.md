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
- ??

## Running in production
You must use following additional variables:
- `-e SENTRY_DSN=<..>`
- `-e SENTRY_SECRET_DSN=<..>`
- `-e CONFIG=<..>`
- `-e PIWIK_ADDRESS=<..>`
- `-e PIWIK_ID=<..>`
- `-e NODE_ENV=production`

## Build new snapshot image
Only Linux and Mac OS are supported.

### Build new latest image
- `./release`

### Build new release image
- `./release release`

### Push images to Dockerhub
- Login to docker `docker login`
- Push `docker push hsldevcom/digitransit-ui`
