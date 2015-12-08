#!/bin/bash
set -e

function buildImage {
  set -x
  SERVER_ROOT=$1
  SENTRY_DNS=$2
  CONFIG=$3
  RELEASE_NAME=$4
  if [ -z "$RELEASE_NAME" ]; then
    docker build --tag="hsldevcom/digitransit-ui:$CONFIG" --build-arg CONFIG=$CONFIG --build-arg SERVER_ROOT=$SERVER_ROOT --build-arg SENTRY_DNS=$SENTRY_DNS .
  else
    docker build --tag="hsldevcom/digitransit-ui:$CONFIG-$RELEASE_NAME" --build-arg CONFIG=$CONFIG --build-arg SERVER_ROOT=$SERVER_ROOT --build-arg SENTRY_DNS=$SENTRY_DNS .
  fi
  set +x
}

############### Let's go! ##################

clear

if [ -z "$SENTRY_DNS" ]; then
  printf "Enter SENTRY_DNS: "
  read SENTRY_DNS
  if [ -z "$SENTRY_DNS" ]; then
    SENTRY_DNS="notused"
  fi
fi

if [ "$1" == "latest" ]; then
  echo "Building digitransit-ui latest"
  buildImage http://beta.digitransit.fi $SENTRY_DNS default
  buildImage http://dev.reittiopas.fi $SENTRY_DNS hsl
elif [ "$1" == "release" ]; then
  RELEASE_NAME=`date +"%Y%m%d%H%M%S"`
  echo "Building digitransit-ui release $RELEASE_NAME"
  buildImage http://beta.digitransit.fi $SENTRY_DNS default $RELEASE_NAME
  buildImage http://dev.reittiopas.fi $SENTRY_DNS hsl $RELEASE_NAME
else
  echo "Error use either 'latest' or 'release'"
  exit 1
fi
