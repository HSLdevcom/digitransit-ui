# Set up logging to Sentry
config = require '../config'
buildInfo = require '../build-info'

if process.env.NODE_ENV == 'production'
  window.Raven = require 'raven-js'
  window.Raven.addPlugin require 'raven-js/plugins/console.js'
  window.Raven.config(config.SENTRY_DSN,
    release: buildInfo.COMMIT_ID
  ).install()
