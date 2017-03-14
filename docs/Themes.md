# Custom themes and configurations

Appearance and behavior of digitransit-ui can be customized by:
- Creating a custom config file to a path `app/configurations/config.<theme>.js`
- Optionally adding custom style definitions to `sass/themes/<theme>` folder
- If dynamic theme mapping to the new theme is desired, the new theme must be added to the
theme map found in `app/configurations/config.default.js`

Check the existing themes such as 'oulu' for details. There is a npm script for initializing all three steps above
with a single command:

- `npm run add-theme <name> '#RRGGBB' <optional navbar logo>`

After running the command, the created skeleton files can be edited further.


## Dynamic theme mapping

The UI can change the theme per request. This happens by defining how host names are mapped to theme names. See config.default.js
for details.


## Themes in development mode

Dynamic theme mapping is not available when the UI server is launched as 'npm run dev'. The desired theme can de selected as:
- `CONFIG=<theme> npm run dev`


## Themes in production mode

Dynamic theme mapping is available by default in production mode i.e. when the app is launched using `npm start` command. A single
selected theme can be forced by setting the `CONFIG` env. variable:
- `CONFIG=<theme> npm start`


## Building the production version

The build command `npm run build` collects all existing themes found from `app/configurations` folder. To build with a single theme,
use the command:

- `CONFIG=<theme> npm run build`

To avoid illegal references to nonexistent themes, such a limited build could be run as:

- `CONFIG=<theme> npm start`







