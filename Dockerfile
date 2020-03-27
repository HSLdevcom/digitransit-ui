FROM node:10-slim
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
  # install dependencies
  apt-get update && apt-get -qq install python make g++ gcc libpng16-16 libpng-dev nasm -y && \
  yarn install && \
  # build actual application
  yarn run build && \

  # clean up starts here
  rm -rf static docs test /tmp/* && \
  # remove the dev dependencies from the final image, amazingly this saves 500MB
  # https://github.com/yarnpkg/yarn/issues/696
  yarn install --production --ignore-scripts --prefer-offline && \
  # clean global npm depdency cache
  yarn cache clean && \
  # remove apt dependencies and caches
  apt-get remove python make g++ gcc libpng16-16 libpng-dev nasm -y && \
  apt-get autoremove -y && \
  rm -rf /tmp/* /var/lib/apt/lists/* /var/cache/apt/* ${WORK}/node_modules/.cache && \
  du -a / | sort -n -r | head -n 100

CMD yarn run start
