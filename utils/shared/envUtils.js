const Environment = Object.freeze({
  Development: 'development',
  Production: 'production',
});

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
  const value = config ? config.RUN_ENV : process.env.RUN_ENV;
  return value === Environment.Development;
}
