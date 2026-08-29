/**
 * Vite-only build-time map: every configuration image under
 * `app/configurations/images/` → its hashed asset URL. The `?url` query keeps
 * each image a hashed file in `_static/assets/` (as before the Vite migration)
 * but WITHOUT emitting a per-logo JS wrapper chunk — the ~50-entry
 * `{ path: url }` object inlines into whichever chunk pulls in `importLogo`.
 *
 * `import.meta.glob` is a Vite macro with no equivalent in the mocha unit-test
 * loader, so this module is stubbed to `{}` there (see
 * `test/unit/helpers/babel-register.js`); the `import.meta.env` guard covers the
 * ESM test-loader path as well.
 */
const logos = import.meta.env
  ? import.meta.glob('../configurations/images/**/*.{svg,png,jpg}', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  : {};

export default logos;
