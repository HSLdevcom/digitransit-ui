#/bin/bash

# do nothing if the build is for tagging a prod release
if [ -n "$TRAVIS_TAG" ]; then exit 0; fi

echo -e "export const COMMIT_ID = '${TRAVIS_COMMIT}';\nexport const BUILD_TIME = '"`date -Iminutes -u`"';" > app/buildInfo.js

set -e
ORG=${ORG:-hsldevcom}
echo "*** Tag:" $TRAVIS_TAG
yarn install
yarn run lint
docker build -t $ORG/digitransit-ui:ci-$TRAVIS_COMMIT .
docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
docker push $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
