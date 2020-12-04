#!/bin/bash
set -e

curl -X POST -H 'Content-type: application/json' --data '{"username":"npm publisher","text":"'$PUBLISHED_PACKAGES'\n", "channel": "reittiopas-git"}' ${SLACK_WEBHOOK_URL}
