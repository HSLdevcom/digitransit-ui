#!/usr/bin/env bash

# Local development runner: runs the Relay watchers, the Express server
# (node --watch), webpack-dev-server and, with built packages, the package
# watchers in parallel until interrupted. If any of them exits, the rest are
# stopped too.
#
# `set -m` gives each background job its own process group, so cleanup()
# kills whole process trees (e.g. node --watch's child server process).

cleanup() {
  trap - EXIT INT TERM

  echo "Stopping development processes..."

  for pid in "${pids[@]}"; do
    kill -- "-$pid" 2>/dev/null || true
  done

  wait 2>/dev/null || true
}

# Returns as soon as any tracked job exits. `wait -n` needs bash >= 4.3;
# macOS ships bash 3.2, so fall back to polling with `kill -0` there.
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

trap cleanup EXIT INT TERM

yarn static

# webpack-dev-server bundles the workspace packages' src/ by default (see
# config/workspacePackageSource.config.js). USE_BUILT_WORKSPACE_PACKAGES=true
# uses their built lib/ instead, e.g. to debug a Rollup build. Build before
# webpack-dev-server starts: its filesystem cache can keep a missing-module
# resolution even after the watchers create lib/.
if [ "$USE_BUILT_WORKSPACE_PACKAGES" = "true" ]; then
  yarn workspace-packages-build
fi

yarn relay-watch &
pids+=("$!")

# query-utils has its own Relay config (artifacts in its lib/__generated__).
yarn workspace @digitransit-search-util/digitransit-search-util-query-utils relay-watch &
pids+=("$!")

# Restarts the server when any module it imports changes. Without
# --watch-preserve-output, each restart would clear the other processes'
# output from the terminal.
node --watch --watch-preserve-output server/server.js &
pids+=("$!")

yarn webpack-dev-server &
pids+=("$!")

if [ "$USE_BUILT_WORKSPACE_PACKAGES" = "true" ]; then
  yarn workspace-packages-watch &
  pids+=("$!")
fi

# If any dev process exits, terminate the rest.
wait_any
