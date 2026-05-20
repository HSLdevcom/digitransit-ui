#!/usr/bin/env bash

# See the themeMap in app/configurations/config.default.js for configuration options.

_ui () {
    CONFIG=$1 API_SUBSCRIPTION_QUERY_PARAMETER_NAME=digitransit-subscription-key API_SUBSCRIPTION_HEADER_NAME=digitransit-subscription-key API_SUBSCRIPTION_TOKEN=$SUBSCRIPTION_KEY yarn run dev
}

uidev () {
    if [ "$DEV_SUBSCRIPTION_KEY" = "" -a "$NO_SUBSCRIPTION_KEY" != "true" ]; then
        echo "In order to use the UI with the development API you need to set the DEV_SUBSCRIPTION_KEY environment variable."
        echo "If you want to run the UI without a subscription key, set NO_SUBSCRIPTION_KEY=true."
        return 1 2>/dev/null
    fi
    SUBSCRIPTION_KEY="$DEV_SUBSCRIPTION_KEY" _ui $1
}

uiprod () {
    if [ "$SUBSCRIPTION_KEY" = "" -a "$NO_SUBSCRIPTION_KEY" != "true" ]; then
        echo "In order to use the UI with the production API you need to set the SUBSCRIPTION_KEY environment variable."
        echo "If you want to run the UI without a subscription key, set NO_SUBSCRIPTION_KEY=true."
        return 1 2>/dev/null
    fi
    API_URL="https://api.digitransit.fi" _ui $1
}

uilocal () {
    if [ "$DEV_SUBSCRIPTION_KEY" = "" -a "$NO_SUBSCRIPTION_KEY" != "true" ]; then
        echo "In order to use the UI with a local OTP instance you need to set the DEV_SUBSCRIPTION_KEY environment variable."
        echo "The subscription key is necessary for e.g. map tiles."
        echo "If you want to run the UI without a subscription key, set NO_SUBSCRIPTION_KEY=true."
        return 1 2>/dev/null
    fi
    OTP_URL=http://localhost:9080/otp/ SUBSCRIPTION_KEY="$DEV_SUBSCRIPTION_KEY" _ui $1
}
