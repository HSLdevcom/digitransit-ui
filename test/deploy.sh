#/bin/bash
set -e
ORG=${ORG:-hsldevcom}
DOCKER_IMAGE=$ORG/digitransit-ui
LATEST_IMAGE=$DOCKER_IMAGE:latest
PROD_IMAGE=$DOCKER_IMAGE:prod

if [[ -n "$TRAVIS_TAG" || ( "$TRAVIS_PULL_REQUEST" = "false") ]]; then

  docker login -u $DOCKER_USER -p $DOCKER_AUTH

  if [ -n "$TRAVIS_TAG" ]; then
    docker pull $LATEST_IMAGE
    echo "Pushing :prod release to Docker Hub"
    docker tag $LATEST_IMAGE $PROD_IMAGE
    docker push $PROD_IMAGE
  else
    if [ "$TRAVIS_BRANCH" = "prod" ]; then
      #sanity check to skip invalid branch name
      echo Not Pushing :prod tag to Docker Hub
      exit 0
    fi
    if [ "$TRAVIS_BRANCH" = "master" ]; then
      BRANCH_IMAGE=$LATEST_IMAGE
    else
      BRANCH_IMAGE=$DOCKER_IMAGE:$TRAVIS_BRANCH
    fi
    CI_IMAGE=$DOCKER_IMAGE:ci-$TRAVIS_COMMIT
    echo -e "export const COMMIT_ID = \"${TRAVIS_COMMIT}\";\nexport const BUILD_TIME = \""`date -Iminutes -u`"\";" > app/buildInfo.js
    docker build -t $CI_IMAGE .
    echo "Pushing ci image to Docker Hub"
    docker push $BRANCH_IMAGE
    docker tag $CI_IMAGE $LATEST_IMAGE
    docker push $LATEST_IMAGE
  fi
fi
