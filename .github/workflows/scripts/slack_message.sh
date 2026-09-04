#!/usr/bin/env bash
set -e

if [ -z "${SLACK_CHANNEL_ID}" ]; then
    exit 0
fi

if [ -n "${SUMMARY_FILE}" ] && [ -f "${SUMMARY_FILE}" ]; then
    PACKAGE_LIST=$(jq -r '.[] | " - \(.packageName)@\(.version)"' "${SUMMARY_FILE}")
    TEXT="Published packages:
${PACKAGE_LIST}"
else
    TEXT="${SLACK_MESSAGE_TEXT}"
fi

MSG=$(jq -n \
    --arg channel "${SLACK_CHANNEL_ID}" \
    --arg text "${TEXT}" \
    '{channel: $channel, text: $text, username: "NPM publisher"}')

curl -X POST -H 'Content-Type: application/json' -H "Authorization: Bearer ${SLACK_ACCESS_TOKEN}" -H 'Accept: */*' -d "$MSG" 'https://slack.com/api/chat.postMessage'
