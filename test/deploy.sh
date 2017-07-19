#/bin/bash
set -e
ORG=${ORG:-hsldevcom}

if [[ -n "$TRAVIS_TAG" || ( "$TRAVIS_BRANCH" = "master" && "$TRAVIS_PULL_REQUEST" = "false") ]]; then
  docker pull $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
  docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
  if [ -n "$TRAVIS_TAG" ]; then
      echo "Pushing prod release to docker"
      docker tag $ORG/digitransit-ui:ci-$TRAVIS_COMMIT $ORG/digitransit-ui:prod
      docker push $ORG/digitransit-ui:prod
  else
      echo "Pushing dev release to docker"
      docker tag $ORG/digitransit-ui:ci-$TRAVIS_COMMIT $ORG/digitransit-ui:latest
      docker push $ORG/digitransit-ui:latest
  fi
fi
