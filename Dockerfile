FROM node:10
MAINTAINER Reittiopas version: 0.1

EXPOSE 8080

ENV \
  # Where the app is built and run inside the docker fs \
  WORK=/opt/digitransit-ui \
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
  NODE_OPTS='' \
  RELAY_FETCH_TIMEOUT='' \
  ASSET_URL='' \
  STATIC_MESSAGE_URL=''

WORKDIR ${WORK}
ADD . ${WORK}

RUN \
  yarn install --silent && \
  yarn run build && \
  rm -rf static docs test /tmp/* && \
  yarn cache clean

CMD yarn run start
