# UI-tests

Automated tests for digitransit-ui are written in Mocha format with custom extensions. They are executed using Nightwatch.js using its WebDriver remote API. Tests can be run either locally or in BrowserStack.

## Folder structure
- 'test' all the actual tests
- 'test/api' reusable modules
- 'test/config' nightwatch config
- 'test/script' scripts that actually run the tests
- 'test/binaries' Selenium standalone implementation and BrowserStack tunneling software (automatically downloaded)

## Requirements
- You need Linux or OSX to run the tests

## Running tests

Running the tests starts a local dev server (with nowatch and HSL config) to port 8000 (iPhone 6+ on BrowserStack can only use a limited number of ports).

Using local firefox
```
npm run test-local
```

Using BrowserStack
```
npm run test-browserstack -- YOUR_BROWSERSTACK_USERNAME YOUR_BROWSERSTACK_KEY
```

## :warning: Known issues
- Local: PhantomJS end-to-end tests do not currently work, but it can be run with "node_modules/nightwatch/bin/nightwatch -e phantom --skiptags nophantom"
- BrowserStack: For some reason Android and IE11 on Windows 10 won't work with local server, but do work when deployed publicly.
- BrowserStack: IE has bugs and fails tests.

## Test output
Test output and screenshots will be generated to 'test_output'

## Writing tests

At top-level use the [suite](../test/api/suite.js) construct to reuse common test setup code. The browser you get is an upgraded version with useful extra methods, such as setCurrentPosition. See other tests for examples.

The basic structure is then this:
```js
var suite = require('./suite.js').suite;

suite('Frontpage', function () {
  it('should have title', function (browser) {
    browser.expect.element('span.title').text.to.contain('Digitransit');
  });
});
```

# Acceptance tests (:warning: Work in progress)

## Folder locations
- 'acceptance-tests'-folder contains all acceptance tests in Gherkin format

## Running acceptance tests
- run: npm run test-acceptance
