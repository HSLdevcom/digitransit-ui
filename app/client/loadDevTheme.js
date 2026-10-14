// Dev-only entry module (see webpack.config.js, added to `entry.main`
// only when `isDevelopment`), so this dynamic `import` never bundles every
// theme's SCSS into production (see PR #5929).
//
// Reads `window.config.CONFIG` instead of `process.env.CONFIG`: this runs in
// the browser, where `process.env.CONFIG` isn't available unless explicitly
// wired through DefinePlugin/EnvironmentPlugin (which this project doesn't do
// for CONFIG). `window.config` is the server-injected config object
// `app/client.js` uses for everything else, and `.CONFIG` is the active theme.
//
// In dev, webpack's `ContextReplacementPlugin` narrows this import's context
// to just the active theme, so only that theme's CSS is ever resolved here.
//
// Fire-and-forget (not awaited): this module's `import()` calls are dynamic
// requests, resolved asynchronously, so the theme CSS applies a tick after
// `app/client.js` starts running rather than before it - awaiting here would
// need `experiments.topLevelAwait` enabled in webpack.config.js, which isn't
// worth it for a dev-only convenience.
import(
  `../../sass/themes/${window.config.CONFIG || 'default'}/main.scss`
).catch(() => import('../../sass/themes/default/main.scss'));
