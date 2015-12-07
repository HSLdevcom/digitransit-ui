FROM node:0.12
MAINTAINER Reittiopas version: 0.1

#### Environment variables #####
# API_URL: Url where OpenTripPlanner and Geocoding APIs are used.
# - Example: API_URL="": uses localhost
# - Example: API_ULR="http://matka.hsl.fi": uses matka.hsl.fi
# SENTRY_DNS: Sentry DNS if needed
# SENTRY_SECRET_DSN: Sentry secret if needed
# PORT: Http port for application
# CONFIG: config theme for application
# - Example: CONFIG="hsl": uses HSL version
# - Example: CONFIG="default": uses white label version

ENV workdir="/opt/digitransit-ui"
WORKDIR ${workdir}

# Dependencies
RUN apt-get update
RUN apt-get install -y git libglew-dev
RUN npm install -g npm@3

# App
RUN mkdir -p ${workdir}
ADD . ${workdir}

ENV ROOT_PATH=""
ENV SERVER_ROOT=${API_URL}

RUN npm install && \
  npm run static && \
  npm run build

CMD export PORT=${PORT}; npm run start
