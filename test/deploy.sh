#/bin/bash
set -e
ORG=${ORG:-hsldevcom}
DOCKER_IMAGE=digitransit-ui


function tagandpush {
  docker tag $ORG/digitransit-ui:ci-$TRAVIS_COMMIT $ORG/$DOCKER_IMAGE:$1
  docker push $ORG/$DOCKER_IMAGE:$1
}

if [[ -n "$TRAVIS_TAG" || ( "$TRAVIS_PULL_REQUEST" = "false") ]]; then
  docker pull $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
  docker login -u $DOCKER_USER -p $DOCKER_AUTH
  if [ -n "$TRAVIS_TAG" ]; then
    echo "Pushing :prod release to Docker Hub"
    tagandpush prod
  else
    if [ "$TRAVIS_BRANCH" = "prod" ]; then
      echo Not Pushing :prod tag to Docker Hub
      exit 0
    fi
    if [ "$TRAVIS_BRANCH" = "master" ]; then
      echo Pushing latest tag to Docker Hub
      tagandpush latest
    else
      echo Pushing $TRAVIS_BRANCH tag to Docker Hub
      tagandpush $TRAVIS_BRANCH
    fi
  fi
fi
