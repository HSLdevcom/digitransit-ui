#/bin/bash
set -e
ORG=${ORG:-hsldevcom}
echo "*** Tag:" $TRAVIS_TAG
yarn install
yarn run lint
docker build -t $ORG/digitransit-ui:ci-$TRAVIS_COMMIT .
docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
docker push $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
