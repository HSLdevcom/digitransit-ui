# syntax = docker/dockerfile:1.4
FROM node:20-slim

WORKDIR /opt/digitransit-ui

ARG CONFIG=''
ENV CONFIG=${CONFIG}

COPY . .

RUN \
  yarn install \
  && yarn setup \
  && yarn run relay \
  && rm -rf node_modules/.cache \
  && rm -rf /tmp/Relay*

LABEL org.opencontainers.image.title="digitransit-debug-ui"
LABEL org.opencontainers.image.description="open nationwide journey planning platform"
LABEL org.opencontainers.image.authors="digitransit@hsl.fi"
LABEL org.opencontainers.image.documentation="https://digitransit.fi"
LABEL org.opencontainers.image.source="https://github.com/HSLdevcom/digitransit-ui/tree/v3"
LABEL org.opencontainers.image.revision="3"
LABEL org.opencontainers.image.licenses="(AGPL-3.0 OR EUPL-1.2)"

EXPOSE 8080

ARG WEBPACK_DEVTOOL=''
ENV \
  # App specific settings to override when the image is run \
  PORT=8080 \
  API_URL='' \
  MAP_URL='' \
  OTP_URL='' \
  GEOCODING_BASE_URL='' \
  APP_PATH='' \
  CONFIG=$CONFIG \
  NODE_ENV='' \
  RUN_ENV='' \
  NODE_OPTS='--title=digitransit-ui' \
  RELAY_FETCH_TIMEOUT='' \
  WEBPACK_DEVTOOL=$WEBPACK_DEVTOOL \
  ASSET_URL='' \
  STATIC_MESSAGE_URL=''

CMD yarn dev
