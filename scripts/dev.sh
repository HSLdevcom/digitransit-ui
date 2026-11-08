#!/usr/bin/env bash

# Local development runner: runs Relay, the Express dev server (node --watch,
# which also compiles the client bundle, see
# server/middleware/devMiddleware.js) and the Digitransit package watcher
# (scripts/packages/watch.js) in parallel until interrupted.
#
# `set -m` gives each backgrounded job its own process group. This allows
# cleanup to terminate the whole process tree for tools such as `node --watch`
# (which runs the server in a child process) instead of only killing the
# direct process.
#
# If any one job exits early (crash), we want to notice and clean up the
# rest rather than leaving a partially-broken dev session running. That
# needs a "wait for the first of several background jobs" mechanism; see
# wait_any() below for how that is done in a mac/Linux-compatible way.

cleanup() {
  trap - EXIT INT TERM

  echo "Stopping development processes..."

  for pid in "${pids[@]}"; do
    kill -INT -- "-$pid" 2>/dev/null || true
  done

  wait 2>/dev/null || true
}

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

set -eo pipefail
set -m

if [ -z "$CONFIG" ]; then
    echo "CONFIG is not set, using 'default'. Set CONFIG=<name> to use a regional deployment (see server/configs/config.default.js's themeMap)."
fi

export CONFIG="${CONFIG:-default}"
export API_SUBSCRIPTION_QUERY_PARAMETER_NAME="${API_SUBSCRIPTION_QUERY_PARAMETER_NAME:-digitransit-subscription-key}"
export API_SUBSCRIPTION_HEADER_NAME="${API_SUBSCRIPTION_HEADER_NAME:-digitransit-subscription-key}"
export API_SUBSCRIPTION_TOKEN="${API_SUBSCRIPTION_TOKEN:-}"

export RUN_ENV="${RUN_ENV:-development}"
export NODE_ENV="${NODE_ENV:-development}"

if [ -z "$API_SUBSCRIPTION_TOKEN" ]; then
    echo "You should set API_SUBSCRIPTION_TOKEN to a subscription key, depending on the environment you are using."    
    echo "A local OTP instance still requires a development subscription key for full functionality."
fi

case "$API_TYPE" in
  "")
    export API_URL="${API_URL:-https://dev-api.digitransit.fi}"
    echo "Using API_URL=$API_URL"
    ;;
  development)
    # This is the default in config.default.js
    export API_URL="https://dev-api.digitransit.fi"
    echo "Using API_URL=$API_URL"
    ;;
  production)
    export API_URL="https://api.digitransit.fi"
    echo "Using API_URL=$API_URL"
    ;;
  local)
    export API_URL="https://dev-api.digitransit.fi"
    export OTP_URL="http://localhost:9080/otp/"
    echo "Using API_URL=$API_URL"
    echo "Setting OTP_URL=$OTP_URL"
    ;;
  *)
    echo "Invalid API_TYPE=$API_TYPE. Valid values are: development, production, local." >&2
    exit 1
    ;;
esac

pids=()

trap cleanup EXIT INT TERM

yarn static

yarn sprites

# Build the digitransit-* packages once, synchronously, before starting the
# server (which compiles the client bundle) and the package watcher below. On
# a fresh clone (or after `lib/` is removed/out of date) the packages'
# `lib/index.js` outputs don't exist yet; webpack's persistent filesystem cache
# (see webpack.config.js) doesn't reliably invalidate when those outputs later
# appear via the watcher, so it can permanently cache a broken/missing module
# resolution. Building here first (cached by Nx, and running query-utils'
# relay-compiler) ensures webpack always sees valid output on its first
# compile.
yarn packages-build

yarn relay-watch &
pids+=("$!")

# digitransit-search-util-query-utils has its own relay-compiler config
# (separate from the root app's) for the graphql`` tags in its src. The
# package watcher doesn't run relay-compiler, so without this it wouldn't
# regenerate src/__generated__ (which the watcher then rebuilds from) if one
# of its queries is edited during a dev session.
yarn workspace @digitransit-search-util/digitransit-search-util-query-utils relay-watch &
pids+=("$!")

# Node's built-in watch mode restarts the server whenever any module in its
# loaded import graph changes (server/**, utils/{shared,server}/**, region
# configs, webpack.config.js); a restart recompiles the client bundle from
# webpack's filesystem cache. --watch-preserve-output keeps Node from clearing the terminal on
# every restart, which would wipe the other processes' interleaved output.
node --watch --watch-preserve-output server/server.js &
pids+=("$!")

yarn sprites --watch &
pids+=("$!")

yarn packages-watch &
pids+=("$!")

# If any dev process exits, terminate the rest.
wait_any
