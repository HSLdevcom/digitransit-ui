#!/bin/bash
set -e

if [ -n "${SLACK_CHANNEL_ID}" ]; then
    MSG='{"channel": "'$SLACK_CHANNEL_ID'","text":"'"${PUBLISHED_PACKAGES}"'\n", "username": "NPM publisher"}'
    curl -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer $SLACK_ACCESS_TOKEN" -H 'Accept: */*' -d "$MSG" 'https://slack.com/api/chat.postMessage'
fi
