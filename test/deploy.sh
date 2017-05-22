#/bin/bash
set -e
ORG=${ORG:-hsldevcom}
yarn install

docker run -d -e CONFIG=hsl -p 127.0.0.1:8080:8080 $ORG/digitransit-ui:ci-$TRAVIS_COMMIT
wget -N http://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
CHROMEDRIVER=./chromedriver test/flow/script/run-flow-tests.sh
RESULT=$?
if [ $RESULT -eq 0 ]; then
  if [[ "$TRAVIS_BRANCH" = "master" && "$TRAVIS_PULL_REQUEST" = "false" ]]; then
      echo "Pushing dev release to docker"
      docker login -e $DOCKER_EMAIL -u $DOCKER_USER -p $DOCKER_AUTH
      docker tag $ORG/digitransit-ui:ci-$TRAVIS_COMMIT $ORG/digitransit-ui:latest
      docker push $ORG/digitransit-ui:latest
      if [ -z "$TRAVIS_TAG" ]; then
          echo "Pushing prod release to docker"
          docker tag $ORG/digitransit-ui:ci-$TRAVIS_COMMIT $ORG/digitransit-ui:prod
          docker push $ORG/digitransit-ui:prod
      fi
  fi
fi
exit $RESULT
