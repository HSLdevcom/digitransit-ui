Digitransit-ui is configured using several configuration files or command line interface (CLI) options.

# Config.*.js file
These files are located in the `app/configurations` directory.
A default file called `config.default.js` and many deployment specific versions like `config.oulu.js` or `config.waltti.js` are present.
You can create this file manually or by using an existing script like `yarn run add-theme <new_theme>`.
Please refer to the [Themes](https://github.com/HSLdevcom/digitransit-ui/blob/master/docs/Themes.md) documentation page for details
about how to create a configuration file for a customized theme.
The following list, though it might be incomprehensive, descripes availabe options for this config file.

* APP_TITLE: Name the location (e.g. city, municipality, state, aso.) to be served.
* CONFIG: Define the configuration file to be loaded for the Digitransit-ui instance if it should be different from `config.default.js`.
For instance, if you are about to run a Digitransit instance for the `Oulu` area, you will define `CONFIG=oulu` to get `config.oulu.js`.
