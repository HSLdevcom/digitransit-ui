#/bin/bash

set -e

yarn install
yarn lint
yarn build
