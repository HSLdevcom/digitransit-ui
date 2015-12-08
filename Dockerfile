FROM node:5.1
MAINTAINER Reittiopas version: 0.1

# Build variables
ARG SERVER_ROOT
ARG CONFIG
ARG SENTRY_DNS

# Run variables
ENV WORK=/opt/digitransit-ui
ENV SENTRY_SECRET_DSN=
ENV PORT=8080
ENV ROOT_PATH=
ENV SERVER_ROOT=${SERVER_ROOT}

WORKDIR ${WORK}

# Add application
RUN mkdir -p ${WORK}
ADD . ${WORK}

# Build
RUN npm install && \
  npm run static && \
  npm rebuild node-sass && \
  npm run build

CMD npm run start
