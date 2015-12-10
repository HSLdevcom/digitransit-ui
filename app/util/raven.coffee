# Set up logging to Sentry
config = require '../config'

if process.env.NODE_ENV == 'production'
  Raven = require 'raven-js'
  require 'raven-js/plugins/native.js'
  require 'raven-js/plugins/console.js'
  Raven.config(config.SENTRY_DSN).install()
