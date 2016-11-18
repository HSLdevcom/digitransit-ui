FROM node:6
MAINTAINER Reittiopas version: 0.1

EXPOSE 8080
LABEL io.openshift.expose-services 8080:http

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
  APP_PATH='' \
  CONFIG='' \
  PIWIK_ADDRESS='' \
  PIWIK_ID='' \
  NODE_ENV=''

WORKDIR ${WORK}
ADD . ${WORK}

# Build and set permissions for arbitary non-root users in OpenShift
# (https://docs.openshift.org/latest/creating_images/guidelines.html#openshift-specific-guidelines)
RUN \
  npm install && \
  npm run static && \
  npm rebuild node-sass && \
  npm run build && \
  rm -rf static docs test /tmp/* && \
  npm prune --production && \
  npm cache clean && \
  chmod -R a+rwX . && \
  chown -R 9999:9999 ${WORK}

# Don't run as root, because there's no reason to (https://docs.docker.com/engine/articles/dockerfile_best-practices/#user).
# This also reveals permission problems on local Docker, before pushing to OpenShift.
USER 9999

CMD npm run start
