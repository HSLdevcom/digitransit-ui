#!/usr/bin/env bash

# Local development runner: runs Relay, the SSR dev server (nodemon),
# webpack-dev-server and the Digitransit workspace watchers in parallel
# until interrupted.
#
# `set -m` gives each backgrounded job its own process group. This allows
# cleanup to terminate the whole process tree for tools such as nodemon and
# webpack-dev-server instead of only killing the direct yarn process.

set -eo pipefail
set -m

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
wait -n
