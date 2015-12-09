# Set up logging to Sentry
config = require '../config'

if config.NODE_ENV == 'production'
  Raven = require 'raven-js'
  Raven.config(config.SENTRY_DSN).install()

  # Rebind console.error if it exists so that we can catch async exceptions from React
  # We want the original 'this' here so don't use =>

  if window.console
    console_error = console.error

    # Fix console.error.apply etc. for IE9
    if typeof console.log == "object"
      ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"]
      .forEach(
        ((method) -> console[method] = @bind(console[method], console))
        , Function.prototype.call)

    console.error = (message, error) ->
      Raven.captureException(error)
      console_error.apply(this, arguments)

  else
    window.console = error: (message, error) -> Raven.captureException(error)
