#/bin/bash

set -e

yarn setup
yarn lint
yarn build
