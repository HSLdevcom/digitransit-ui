[![Build](https://github.com/hsldevcom/digitransit-ui/workflows/Process%20master%20push%20or%20pr/badge.svg?branch=master)](https://github.com/HSLdevcom/digitransit-ui/actions)
[![codecov](https://codecov.io/gh/HSLdevcom/digitransit-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/HSLdevcom/digitransit-ui)


Digitransit-ui is a mobile friendly User interface built to work with Digitransit platform

## Licensing
The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.

## Issues
Our main issue tracking is handled in [https://digitransit.atlassian.net](https://digitransit.atlassian.net)
However, we also monitor this repository's issues and import them to Jira. You can create issues in GitHub.

## Demos
* [https://reittiopas.hsl.fi - Helsinki city area demo](https://reittiopas.hsl.fi/)
* [https://opas.matka.fi/ - National demo](https://opas.matka.fi/)

## Testing

Digitransit-ui is tested to work on the latest and the second latest major versions of Firefox, Chrome, Safari and Edge. Additionally, latest version of IE and couple of latest versions Samsung Internet for Android should work almost optimally. For automated testing we use [Nightwatch](http://nightwatchjs.org/) and [BrowserStack](http://browserstack.com/).
- Continuous Integration: [https://travis-ci.org/HSLdevcom/digitransit-ui](https://travis-ci.org/HSLdevcom/digitransit-ui)
- BrowserStack (not public): [BrowserStack](http://www.browserstack.com/)

Visual tests are run with Gemini. The images must be created using same browser on same platform to eliminate font rendering issues. We use BrowserStack for that too.

More information about [testing](docs/Tests.md).

## Documentation
* [Terms](docs/Terms.md)
* [Architecture](docs/Architecture.md)
* [Positioning](docs/Position.md)
* [Locations](docs/Location.md)
* [Run in Docker](docs/Docker.md)
* [Style guide](http://beta.digitransit.fi/styleguide)
* [Installation](docs/Installation.md)
* [Tests](docs/Tests.md)
* [Z-Index Index](docs/ZIndex.md)
* [Benchmark results and UX](docs/JSBenchmark.md)
* [Navigation](docs/Navigation.md)
* [Themes](docs/Themes.md)
* [GeoJSON](docs/GeoJson.md)
