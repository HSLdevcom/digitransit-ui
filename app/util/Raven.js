import config from '../config';
import buildInfo from '../build-info';

let Raven;

if (process.env.NODE_ENV === 'production') {
  Raven = require('raven-js'); // eslint-disable-line global-require
  Raven.addPlugin(require('raven-js/plugins/console.js'));  // eslint-disable-line global-require

  Raven.config(config.SENTRY_DSN, {
    release: buildInfo.COMMIT_ID,
  }).install();
} else {
  Raven = {
    captureMessage: console.error, // eslint-disable-line no-console
  };
}

export default Raven;
