#!/usr/bin/env bash

# Local development runner: runs Relay, the SSR dev server (nodemon),
# webpack-dev-server and the Digitransit workspace watchers in parallel
# until interrupted.
#
# `set -m` gives each backgrounded job its own process group. This allows
# cleanup to terminate the whole process tree for tools such as nodemon and
# webpack-dev-server instead of only killing the direct yarn process.
#
# If any one job exits early (crash), we want to notice and clean up the
# rest rather than leaving a partially-broken dev session running. That
# needs a "wait for the first of several background jobs" mechanism; see
# wait_any() below for how that is done in a mac/Linux-compatible way.

set -eo pipefail
set -m

if [ -z "$CONFIG" ]; then
    echo "CONFIG is not set, using 'default'. Set CONFIG=<name> to use a regional deployment (see app/configurations/config.default.js's themeMap)."
fi

export CONFIG="${CONFIG:-default}"
export API_SUBSCRIPTION_QUERY_PARAMETER_NAME="${API_SUBSCRIPTION_QUERY_PARAMETER_NAME:-digitransit-subscription-key}"
export API_SUBSCRIPTION_HEADER_NAME="${API_SUBSCRIPTION_HEADER_NAME:-digitransit-subscription-key}"
export API_SUBSCRIPTION_TOKEN="${API_SUBSCRIPTION_TOKEN:-}"

export API_TYPE="${API_TYPE:-development}"
export RUN_ENV="${RUN_ENV:-development}"
export NODE_ENV="${NODE_ENV:-development}"

if [ -z "$API_SUBSCRIPTION_TOKEN" ]; then
    echo "You should set API_SUBSCRIPTION_TOKEN to a subscription key, depending on the environment you are using."    
    echo "A local OTP instance still requires a development subscription key for full functionality."
fi

case "$API_TYPE" in
  development)
    # This is the default in config.default.js
    echo "Using API_URL=https://dev-api.digitransit.fi"
    ;;
  production)
    export API_URL="https://api.digitransit.fi"
    echo "Using API_URL=$API_URL"
    ;;
  local)
    export OTP_URL="http://localhost:9080/otp/"
    echo "Setting OTP_URL=$OTP_URL"
    ;;
  *)
    echo "Invalid API_TYPE=$API_TYPE. Valid values are: development, production, local." >&2
    exit 1
    ;;
esac

pids=()

cleanup() {
  trap - EXIT INT TERM

  echo "Stopping development processes..."

  for pid in "${pids[@]}"; do
    kill -- "-$pid" 2>/dev/null || true
  done

  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# `wait -n` (wait for the first of several background jobs to exit) needs
# bash >= 4.3. macOS ships bash 3.2, where `wait -n` errors with
# "wait: -n: invalid option". Use the native form when available (as on
# Linux and any newer bash), and fall back to a simple kill -0 liveness
# poll loop otherwise, which works on any bash version. Either path
# returns as soon as one tracked process exits, so the script falls off
# the end, the EXIT trap fires, and cleanup() tears down the rest of the
# process group.
wait_any() {
  if (( BASH_VERSINFO[0] > 4 || (BASH_VERSINFO[0] == 4 && BASH_VERSINFO[1] >= 3) )); then
    wait -n
  else
    while true; do
      for pid in "${pids[@]}"; do
        kill -0 "$pid" 2>/dev/null || return
      done
      sleep 1
    done
  fi
}

yarn run static

yarn run relay-watch &
pids+=("$!")

# digitransit-search-util-query-utils has its own relay-compiler config
# (separate from the root app's) for the graphql`` tags in its src. Its
# "watch" script only runs relay-compiler once before starting rollup -w,
# so without this it wouldn't regenerate lib/__generated__ if one of its
# queries is edited during a dev session.
(cd digitransit-search-util/packages/digitransit-search-util-query-utils && yarn relay-compiler --watch) &
pids+=("$!")

yarn nodemon \
  -e js,css,scss,html \
  --watch ./server/ \
  --watch ./app/ \
  server/server.js &
pids+=("$!")

yarn webpack-dev-server &
pids+=("$!")

yarn watch-workspaces &
pids+=("$!")

# If any dev process exits, terminate the rest.
wait_any
