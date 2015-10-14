#!/bin/bash

clear
find ./acceptance-tests -name "*.feature" | while read var; do
  head -n 1 ${var}
  node_modules/gherkin-mocha/bin/gherkin-mocha ${var}
done