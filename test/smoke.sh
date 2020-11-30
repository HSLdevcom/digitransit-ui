#/bin/bash

yarn setup > /dev/null
test/flow/script/run-ui-tests.sh smoke $BS_USERNAME $BS_ACCESS_KEY
