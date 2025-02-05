# syntax = docker/dockerfile:1.4
FROM node:20-bookworm

WORKDIR /opt/digitransit-ui

ARG CONFIG=''
ENV CONFIG=${CONFIG}

COPY . .

RUN \
  yarn install \
  && yarn setup \
  && yarn prebuild

EXPOSE 8080

CMD yarn dev
