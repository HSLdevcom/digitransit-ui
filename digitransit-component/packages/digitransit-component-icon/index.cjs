/* eslint-disable global-require */

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./lib/index.development.cjs');
} else {
  module.exports = require('./lib/index.cjs');
}
