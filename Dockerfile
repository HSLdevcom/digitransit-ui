FROM node:5.1
MAINTAINER Reittiopas version: 0.1

EXPOSE 8080
LABEL io.openshift.expose-services 8080:http

# Where the app is built and run inside the docker fs
ENV WORK=/opt/digitransit-ui

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/digitransit-ui

# App specific settings to override when the image is run
ENV SENTRY_DSN=''
ENV SENTRY_SECRET_DSN=''
ENV PORT=8080
ENV API_URL=''
ENV APP_PATH=''
ENV CONFIG=''
ENV PIWIK_ADDRESS=''
ENV PIWIK_ID=''
ENV NODE_ENV=''

WORKDIR ${WORK}
ADD . ${WORK}

# Build and set permissions for arbitary non-root users in OpenShift
# (https://docs.openshift.org/latest/creating_images/guidelines.html#openshift-specific-guidelines)
RUN npm install && \
  npm run static && \
  npm rebuild node-sass && \
  npm run build && \
  npm cache clean && \
  chmod -R a+rwX .

# Don't run as root, because there's no reason to (https://docs.docker.com/engine/articles/dockerfile_best-practices/#user).
# This also reveals permission problems on local Docker, before pushing to OpenShift.
RUN chown -R 9999:9999 ${WORK}
USER 9999

CMD npm run start
