# UI-tests

Automated tests for digitransit-ui are written in Nightwatch format with custom extensions. They are executed using Nightwatch.js using its WebDriver remote API. Tests can be run either locally or in BrowserStack.

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

## Running a single test locally
```
PORT=8000 npm run dev
nightwatch -c ./test/flow/nightwatch.json test/flow/tests/itinerary-search/itinerary-search.js
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

Initial url includes the mock-parameter, which gives the tests functionality to e.g. change position. Here setCurrentPosition is a feature of the upgraded browser object, which in turn requires mock functionality to be present. See also [ServiceStore.js](../app/store/ServiceStore.js).

```js
describe('at Mäkelänrinne', function () {
  before(function (browser, done) {
    browser.setCurrentPosition(60.2, 24.95, 0, done);
  });
  ...
});
```

You can also use this functionality while developing, in the console
```js
// change current position
window.mock.geolocation.setCurrentPosition(60.2, 24.95);

// move north from current position
window.mock.geolocation.move(0.001, 0);

// travel to rautatientori from current position
window.mock.geolocation.demo();
```

# Acceptance tests (:warning: Work in progress)

## Folder locations
- 'acceptance-tests'-folder contains all acceptance tests in Gherkin format

## Running acceptance tests
- run: npm run test-acceptance

# Visual tests

- first run: `USE_PROD_BROWSERS=true CONFIG=hsl npm run dev`
- then run: `BS_USERNAME=user BS_ACCESS_KEY=key npm run test-visual`

To run just subset of tests on ie11:
- Run: `run test-visual -- --grep Departure --browser ie11`

If things change, you need to update the images

- run: BS_USERNAME=user BS_ACCESS_KEY=key ./node_modules/.bin/gemini update test/visual/
