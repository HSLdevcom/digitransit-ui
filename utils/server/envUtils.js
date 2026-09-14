const Environment = Object.freeze({
  Development: 'development',
  Production: 'production',
});

/**
 * Server-side. Whether the app runs in a non-production deployment, from the `RUN_ENV`
 * env var (`development` / `production`; unknown ⇒ production).
 *
 * @returns {boolean}
 */
export function isDevRunEnv() {
  return process.env.RUN_ENV === Environment.Development;
}
