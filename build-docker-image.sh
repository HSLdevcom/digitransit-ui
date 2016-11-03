#!/bin/bash
ORG=hsldevcom
DOCKER_IMAGE=digitransit-ui

# Set these environment variables
#DOCKER_TAG=
#DOCKER_EMAIL=
#DOCKER_USER=
#DOCKER_AUTH=

# Save build info
echo -e "export const COMMIT_ID = \""`git rev-parse HEAD`"\";\nexport const BUILD_TIME = \""`date -Iminutes -u`"\";" > app/buildInfo.js

# Build image
docker build --tag="$ORG/$DOCKER_IMAGE:$DOCKER_TAG" .
docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
docker push $ORG/$DOCKER_IMAGE:$DOCKER_TAG
docker tag -f $ORG/$DOCKER_IMAGE:$DOCKER_TAG $ORG/$DOCKER_IMAGE:latest
docker push $ORG/$DOCKER_IMAGE:latest
