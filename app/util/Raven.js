import { COMMIT_ID } from '../buildInfo';

export default function getRaven(sentryDsn, piwikId) {
  if (sentryDsn) {
    /* eslint-disable global-require */
    const Raven = require('raven-js');
    Raven.addPlugin(require('raven-js/plugins/console'));

    Raven.config(sentryDsn, {
      release: COMMIT_ID,
      stacktrace: true,
    }).install();

    if (piwikId) {
      Raven.setUserContext({ piwik: piwikId });
    }

    return Raven;
  }
  return undefined;
}
