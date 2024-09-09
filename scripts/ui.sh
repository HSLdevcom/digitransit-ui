#!/usr/bin/env bash

ui () {
    CONFIG=$1 API_SUBSCRIPTION_QUERY_PARAMETER_NAME=digitransit-subscription-key API_SUBSCRIPTION_HEADER_NAME=digitransit-subscription-key API_SUBSCRIPTION_TOKEN=$SUBSCRIPTION_KEY yarn run dev
}

uiotp () {
    if [ "$1" = "hsl" ]; then
        OTP_URL=http://localhost:9080/otp/routers/hsl/ ui hsl
    elif [ "$1" = "matka" ]; then
        OTP_URL=http://localhost:9080/otp/routers/finland/ ui matka
    elif [ "$1" = "kela" ]; then
        OTP_URL=http://localhost:9080/otp/routers/kela/ ui kela
    else
        OTP_URL=http://localhost:9080/otp/routers/waltti/ ui $1
    fi
}
