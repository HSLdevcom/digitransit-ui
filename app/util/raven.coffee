# Set up logging to Sentry
config = require '../config'

if process.env.NODE_ENV == 'production'
  Raven = require 'raven-js'
  Raven.addPlugin require 'raven-js/plugins/console.js'
  Raven.config(config.SENTRY_DSN).install()
