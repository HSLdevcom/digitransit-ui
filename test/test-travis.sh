#/bin/bash

if [ -n "$VISUAL" ]; then
  npm run test-visual -- --browser $VISUAL
  exit $?
fi

if [ -n "$NWENV" ]; then
  test/flow/script/run-snap-tests.sh
  exit $?
fi

if [ -n "$LINT" ]; then
  npm run lint
  exit $?
fi
