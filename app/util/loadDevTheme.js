/* eslint-disable global-require, import/no-dynamic-require */
// Dev-only entry module: webpack.config.babel.js only adds this file to
// `entry.main` when `isDevelopment`, so it is never part of the production
// module graph and its dynamic `require` below can't bundle every theme's
// SCSS into a production chunk (see PR #5929 review discussion on the
// previous `if (IS_DEV_BUILD)` runtime guard in app/client.js, which relied
// on webpack's DefinePlugin/dead-code-elimination folding an exact literal
// `process.env.NODE_ENV === 'development'` condition — fragile, since any
// refactor of that condition silently broke the fold).
//
// This module itself runs in the browser, so it must not read
// `process.env.CONFIG`: webpack5 no longer polyfills a `process` global by
// default, and even with one provided, the browser bundle never sees the
// real build-time env vars (`process.env` is just `{}` client-side) unless
// each one is explicitly wired through a DefinePlugin/EnvironmentPlugin,
// which this project doesn't do for CONFIG. `window.config` is already the
// resolved, server-injected config object (set in a `<script>` tag before
// this bundle runs - see app/server.js) and its `CONFIG` field is the same
// active theme name, so read it from there instead - `app/client.js` uses
// the exact same `window.config` for everything else.
//
// In dev, webpack's `ContextReplacementPlugin(themeExpression, selectedTheme)`
// (also dev-only) narrows this require's context to just the active theme,
// so only that theme's CSS is ever resolved here.
try {
  require(`../../sass/themes/${window.config.CONFIG || 'default'}/main.scss`);
} catch (error) {
  require('../../sass/themes/default/main.scss');
}
