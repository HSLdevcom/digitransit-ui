Digitransit-ui, where ui stands for user interface (UI), is configured using several configuration files or command line interface (CLI) options.

# Config.*.js file
These files are located in the `app/configurations` directory.
A default file called `config.default.js` and many deployment specific versions like `config.oulu.js` or `config.waltti.js` are present.
You can create this file manually or by using an existing script like `yarn run add-theme <new_theme>`.
Please refer to the [Themes](https://github.com/HSLdevcom/digitransit-ui/blob/master/docs/Themes.md) documentation page for details
about how to create a configuration file for a customized theme.
The following list, though it might be incomprehensive, descripes availabe options for this config file.

* APP_TITLE: Define the location (e.g. city, municipality, state, aso.) to be served by the UI.
This location is used for instance as browser title or for social media content.
* CONFIG: Define the configuration file to be loaded by the UI if it should be different from `config.default.js`.
For instance, if you are about to run an UI for the `Oulu` area, you will define `CONFIG=oulu` to get `config.oulu.js`.
* MAP_URL: Define the address of the tile server serving map tiles for the background map. You can host your own tiles, buy them from a commercial provider or use free tiles.
* PORT: Define the port number to access the UI service.
