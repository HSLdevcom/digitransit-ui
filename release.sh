#!/bin/bash
set -e

function buildImage {

  RELEASE_NAME=$1
  if [ -z "$RELEASE_NAME" ]; then
    set -x
    docker build --tag="hsldevcom/digitransit-ui:$RELEASE_NAME" .
    set +x
  else
    set -x
    docker build --tag="hsldevcom/digitransit-ui" .
    set +x
  fi

}

############### Let's go! ##################

clear

if [ "$1" == "" ]; then
  echo "Building digitransit-ui latest"
  buildImage
else
  RELEASE_NAME=`date +"%Y%m%d%H%M%S"`
  echo "Building digitransit-ui release $RELEASE_NAME"
  buildImage $RELEASE_NAME
fi
