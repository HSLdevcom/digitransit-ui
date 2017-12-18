import { COMMIT_ID } from '../buildInfo';

export default function getRaven(sentryDsn) {
  if (sentryDsn) {
    /* eslint-disable global-require */
    const Raven = require('raven-js');
    Raven.addPlugin(require('raven-js/plugins/console'));

    Raven.config(sentryDsn, {
      release: COMMIT_ID,
      stacktrace: true,
      sampleRate: 0.1,
    }).install();

    return Raven;
  }
  return undefined;
}
