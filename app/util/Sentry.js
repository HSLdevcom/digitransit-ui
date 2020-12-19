import { COMMIT_ID } from '../buildInfo';

export default function getSentry(sentryDsn) {
  if (sentryDsn) {
    /* eslint-disable global-require */
    const Sentry = require('@sentry/browser');
    Sentry.init({
      dsn: sentryDsn,
      release: COMMIT_ID,
      attachStacktrace: true,
      tracesSampleRate: 0.1,
    });

    return Sentry;
  }
  return undefined;
}
