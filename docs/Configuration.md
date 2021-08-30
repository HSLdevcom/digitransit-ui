Digitransit-ui, where ui stands for user interface (UI), is configured using several configuration files or command line interface (CLI) options.

# Config.*.js file
The `config.*.js` files are located in the `app/configurations` directory.
A default file called `config.default.js` and many deployment specific versions like `config.oulu.js` or `config.waltti.js` are present.
You can create a user specific version of this file manually or by using an existing script like `yarn run add-theme <new_theme>`.
Please refer to the [Themes](https://github.com/HSLdevcom/digitransit-ui/blob/master/docs/Themes.md) documentation page for details
about how to create this configuration file for a customized theme.
The following list, though it might be incomprehensive, descripes common definitions in the config file.

* APP_CONTEXT: ?
* APP_TITLE: Define the location (e.g. city, municipality, state, aso.) to be served by the UI.
This location is used for instance as browser title or for social media content.
* APP_DESCRIPTION: This option is not used by the UI itself.
The assumed purpose is to describe the configuration file.
* APP_PATH: ?
* CONFIG: Define the configuration file to be loaded by the UI if it should be different from `config.default.js`.
For instance, if you are about to run an UI for the `Oulu` area, you will define `CONFIG=oulu` to get `config.oulu.js`.
* ASSET_URL: ?
* API_URL: Define the address of the [Open Trip Planner (OTP)](https://github.com/opentripplanner/OpenTripPlanner) server.
* MAP_URL: Define the address of the tile server serving map tiles for the background map. You can host your own tiles, buy them from a commercial provider or use free tiles.
* OTP_URL: ?
* OTP_TIMEOUT: ?
* GEOCODING_BASE_URL: Define the address of the service for name and address search also known as geocoding service or geocoder. An open source example is [photo](https://github.com/komoot/photon).
* PORT: Define the port number the web server is using to access the UI service.
* REALTIME_PATCH: ?
* STATIC_MESSAGE_URL: Define the URL for the catalogue of static messages loaded by the UI.
* searchParams: This object is used by geocoding queries.
* areaPolygon: This object defines the area this UI instance is expected to return results for, if origin/destination are inside this area. If either origin or destination are outside this area, an [error message](app/component/ItinerarySummaryListContainer.js) is displayed to the user.
* defaultEndpoint: This object defines the default map center the map is zoomed to when not specified otherwise.
