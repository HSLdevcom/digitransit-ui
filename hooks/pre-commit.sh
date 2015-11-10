#!/bin/sh
set -e
set -x

npm run lint
npm run test-local
