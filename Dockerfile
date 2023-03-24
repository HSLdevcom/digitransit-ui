# syntax = docker/dockerfile:1.4
FROM node:12
MAINTAINER Reittiopas version: 0.1

WORKDIR /opt/digitransit-ui

ENV \
  # Picked up by various Node.js tools.
  NODE_ENV=production

EXPOSE 8080

ENV \
  # Used indirectly for saving npm logs etc. \
  HOME=/opt/digitransit-ui \
  # App specific settings to override when the image is run \
  SENTRY_DSN='' \
  SENTRY_SECRET_DSN='' \
  PORT=8080 \
  API_URL='' \
  MAP_URL='' \
  OTP_URL='' \
  GEOCODING_BASE_URL='' \
  APP_PATH='' \
  CONFIG='' \
  NODE_ENV='' \
  RUN_ENV='' \
  # setting a non-empty default value for NODE_OPTS
  # if you don't do this then yarn/node seem to think that you want to
  # execute a file called "" (empty string) and doesn't start the server
  # https://github.com/HSLdevcom/digitransit-ui/issues/4155
  #
  # the --title option just sets the harmless property process.title
  # https://nodejs.org/api/cli.html#cli_title_title
  NODE_OPTS='--title=digitransit-ui' \
  RELAY_FETCH_TIMEOUT='' \
  ASSET_URL='' \
  STATIC_MESSAGE_URL=''

ADD . ${WORK}

RUN \
  yarn && \
  yarn setup && \
  yarn build && \
  rm -rf static docs test /tmp/* .cache && \
  yarn cache clean --all

CMD yarn run start
