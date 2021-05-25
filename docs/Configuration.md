Digitransit-ui is configured using several configuration files or command line interface (CLI) options.

# Config.*.js file
These files are located in the `app/configurations' directory.
A default file called `config.default.js` and many deployment specific versions like `config.oulu.js` or `config.waltti.js` are present.
You can create this file manually or by using an existing script like `yarn run add-theme <new_theme>`.
The following list, though it might be incomprehensive, descripes availabe options for this config file.

* APP_TITLE: Name the location (e.g. city, municipality, state, aso.) to be served.
