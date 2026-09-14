const Environment = Object.freeze({
  Development: 'development',
  Production: 'production',
});

/**
 * Client-side. Whether the app runs in a non-production deployment, from `config.RUN_ENV`
 * (pass `window.config` — the server mirrors `RUN_ENV` into it because `process.env`
 * does not exist in the browser bundle).
 *
 * @param {{RUN_ENV?: string}|null} config
 * @returns {boolean}
 */
export function isDevRunEnv(config) {
  return config?.RUN_ENV === Environment.Development;
}
