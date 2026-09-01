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
// In dev, webpack's `ContextReplacementPlugin(themeExpression, selectedTheme)`
// (also dev-only) narrows this require's context to just the active
// `process.env.CONFIG` theme, so only that theme's CSS is ever resolved here.
try {
  require(`../../sass/themes/${process.env.CONFIG || 'default'}/main.scss`);
} catch (error) {
  require('../../sass/themes/default/main.scss');
}
