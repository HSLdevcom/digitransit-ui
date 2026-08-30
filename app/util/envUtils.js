const Environment = Object.freeze({
  Development: 'development',
  Production: 'production',
});

/**
 * Build mode: `true` only for `NODE_ENV === 'development'` (the local `yarn dev`
 * server / a dev bundle). A prod build, an unset `NODE_ENV` (mocha, CI, a bare
 * `node server/server`) and anything else count as "a real build".
 *
 * webpack's `DefinePlugin` bakes this to a literal in the client bundle; in Node
 * it is a live read of `process.env.NODE_ENV`. It is NOT the deployment tier —
 * one production bundle runs on every tier; for that use `isDevRunEnv`.
 */
export const IS_DEV_BUILD = process.env.NODE_ENV === Environment.Development;

/**
 * Whether the app runs in a non-production deployment, from the `RUN_ENV` env var
 * (`development` / `production`; unknown ⇒ production).
 *
 * @param {{RUN_ENV?: string}|null} [config] On the client pass `window.config` —
 *   the server mirrors `RUN_ENV` into it because `process.env.RUN_ENV` does not
 *   exist in the browser bundle. On the server / during config assembly omit it
 *   to read `process.env.RUN_ENV` directly.
 * @returns {boolean}
 */
export function isDevRunEnv(config) {
  const value =
    (config ? config.RUN_ENV : process.env.RUN_ENV) || Environment.Production;
  return value !== Environment.Production;
}
