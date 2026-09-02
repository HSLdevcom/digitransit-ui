# Digitransit UI - Reittiopas

[![Build](https://github.com/HSLdevcom/digitransit-ui/actions/workflows/dev-pipeline.yml/badge.svg?branch=v3)](https://github.com/HSLdevcom/digitransit-ui/actions)

Digitransit UI is a journey planner user interface built to work with OpenTripPlanner and the Digitransit platform.

## Quick start

- `yarn install`
- `yarn run dev`, then open http://localhost:8080

See [Installation](docs/Installation.md) for full requirements and options, and
[`scripts/ui.sh`](scripts/README.md#using-uish) for running against a DEV/PROD API subscription key.

## Licensing

The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.

## Issues

Our main issue tracking is handled in [https://dev.azure.com/digitransit/digitransit](https://dev.azure.com/digitransit/digitransit)
However, we also monitor this repository's issues and import them to Azure Boards. You can create issues in GitHub.

## Deployments

- HSL Reittiopas (Helsinki region) - [https://reittiopas.hsl.fi](https://reittiopas.hsl.fi/)
- National journey planner - [https://matka.fintraffic.fi](https://matka.fintraffic.fi/)
- See [digitransit.fi](https://digitransit.fi/en/) for more regional deployments

## Testing

Digitransit-ui is tested to work on the latest and the second latest major versions of Firefox, Chromium and Safari.

- Continuous Integration: [https://github.com/HSLdevcom/digitransit-ui/actions](https://github.com/HSLdevcom/digitransit-ui/actions)

Visual tests are run with jest and playwright.

More information about [testing](docs/Tests.md).


## Documentation

- [Architecture](docs/Architecture.md)
- [Terms, Positioning & Locations](docs/Position.md)
- [Run in Docker](docs/Docker.md)
- [Installation](docs/Installation.md)
- [Tests](docs/Tests.md)
- [Z-Index Index](docs/ZIndex.md)
- [Navigation](docs/Navigation.md)
- [Themes](docs/Themes.md)
- [GeoJSON](docs/GeoJson.md)
