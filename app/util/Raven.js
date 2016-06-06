import config from '../config';
import buildInfo from '../build-info';

function getRaven() {
  if (process.env.NODE_ENV === 'production') {
    /* eslint-disable global-require */
    const Raven = require('raven-js');
    Raven.addPlugin(require('raven-js/plugins/console.js'));
    /* eslint-enable global-require */

    Raven.config(config.SENTRY_DSN, {
      release: buildInfo.COMMIT_ID,
    }).install();
    return Raven;
  }
  return {
    captureMessage: console.error, // eslint-disable-line no-console
  };
}

export default getRaven();
