# Custom themes and configurations

Appearance and behavior of digitransit-ui can be customized by:
- Creating a custom config file to a path `server/configs/config.<theme>.js`
- Optionally adding custom style definitions to `sass/themes/<theme>` folder
- Optionally adding theme-owned static assets to `static/assets/<theme>` folder
- If dynamic theme mapping to the new theme is desired, the new theme must be added to the
theme map found in `server/configs/config.default.js`

Check the existing themes such as 'oulu' for details. There is a npm script for initializing all three steps above
with a single command:

- `npm run add-theme <name> '#RRGGBB' <optional navbar logo>`

After running the command, the created skeleton files can be edited further.


## Theme-owned static assets

Files a single deployment owns and the server hands out as-is — the social-media share image
(`socialMedia.image.url`) and any locally hosted GeoJSON layers — live in `static/assets/<theme>/`,
where the directory name is the exact `CONFIG` value. They are served from `/assets/<theme>/...`
and are copied into the served `_static/` directory by `scripts/build/copyStatic.js`.
A theme with no share image of its own inherits `assets/default/social-share.png` from
`config.default.js`. Images that are bundled into the client instead of served per request —
logos, favicons and illustrations — live in `app/client/images/<theme>/`, which follows the same
per-theme naming, with `default/` holding the fallbacks.
`test/unit/server/configs/staticAssets.test.js` verifies that each config's asset urls point at
existing files and that no file under `static/assets/` is unreferenced.


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

The build command `npm run build` collects all existing themes found from `server/configs` folder.

