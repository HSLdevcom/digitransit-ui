#!/bin/bash
set -e

DOCKER_IMAGE="hsldevcom/digitransit-ui"
DOCKER_TAG="prod"

COMMIT_HASH=$(git rev-parse --short "$GITHUB_SHA")

DOCKER_TAG_LONG=$DOCKER_TAG-$(date +"%Y-%m-%dT%H.%M.%S")-$COMMIT_HASH
DOCKER_IMAGE_TAG=$DOCKER_IMAGE:$DOCKER_TAG
DOCKER_IMAGE_TAG_LONG=$DOCKER_IMAGE:$DOCKER_TAG_LONG
DOCKER_IMAGE_LATEST=$DOCKER_IMAGE:latest

docker login -u $DOCKER_USER -p $DOCKER_AUTH

echo "processing prod release"
docker pull $DOCKER_IMAGE_LATEST
docker tag $DOCKER_IMAGE_LATEST $DOCKER_IMAGE_TAG
docker tag $DOCKER_IMAGE_LATEST $DOCKER_IMAGE_TAG_LONG
docker push $DOCKER_IMAGE_TAG
docker push $DOCKER_IMAGE_TAG_LONG

echo Build completed
