Testing is done using Nightwatch.js and WebDriver remote API. Tests can be run either locally or through BrowserStack.

# UI-tests

## folder locations
- 'test'-folder contains all tests
- 'test/config'-folder contains nightwatch config
- 'test/script'-folder contains scripts to that actually run your tests
- 'test/binaries'-folder contains automatically downloaded Selenium standalone implementation and BrowserStack tunneling software

## Requirements
- You need Linux or OSX to run tests

## Running tests using local firefox
- run: npm run test-local

## Running tests using BrowserStack
- run: "npm run test-browserstack -- YOUR_BROWSERSTACK_USERNAME YOUR_BROWSERSTACK_KEY"

## :warning: Known issues
- Local: PhantomJS end-to-end tests do not currently work, but it can be run with "node_modules/nightwatch/bin/nightwatch -e phantom --skiptags nophantom"
- BrowserStack: For some reason Android and IE11 on Windows 10 won't work with local server, but do work when deployed publicly.
- BrowserStack: IE has bugs and fails tests.

## Test output
Test output and screenshots will be generated to 'test_output'

# Acceptance tests (:warning: Work in progress)

## Folder locations
- 'acceptance-tests'-folder contains all acceptance tests in Gherkin format

## Running acceptance tests
- run: npm run test-acceptance
