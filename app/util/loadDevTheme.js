/* eslint-disable global-require, import/no-dynamic-require */
// Dev-only entry module (see webpack.config.babel.js, added to `entry.main`
// only when `isDevelopment`), so this dynamic `require` never bundles every
// theme's SCSS into production (see PR #5929).
//
// Reads `window.config.CONFIG` instead of `process.env.CONFIG`: this runs in
// the browser, where `process.env.CONFIG` isn't available unless explicitly
// wired through DefinePlugin/EnvironmentPlugin (which this project doesn't do
// for CONFIG). `window.config` is the server-injected config object
// `app/client.js` uses for everything else, and `.CONFIG` is the active theme.
//
// In dev, webpack's `ContextReplacementPlugin` narrows this require's context
// to just the active theme, so only that theme's CSS is ever resolved here.
try {
  require(`../../sass/themes/${window.config.CONFIG || 'default'}/main.scss`);
} catch (error) {
  require('../../sass/themes/default/main.scss');
}
