FROM node:0.12
MAINTAINER Pelias

EXPOSE 3100
LABEL io.openshift.expose-services 3100:http

# Where the app is built and run inside the docker fs
ENV WORK=/opt/pelias

# Used indirectly for saving npm logs etc.
ENV HOME=/opt/pelias

WORKDIR ${WORK}
ADD . ${WORK}

# Build and set permissions for arbitary non-root user
RUN npm install && \
  npm test && \
  chmod -R a+rwX .

ADD pelias.json.docker pelias.json

# Don't run as root, because there's no reason to (https://docs.docker.com/engine/articles/dockerfile_best-practices/#user).
# This also reveals permission problems on local Docker.
RUN chown -R 9999:9999 ${WORK}
USER 9999

CMD npm start
