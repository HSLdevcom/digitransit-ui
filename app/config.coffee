if window?
  # Return object that is set to window during server render
  module.exports = window.config
else
  # This is server render. Return correct config file.
  module.exports = require "./config.#{process.env.CONFIG or 'default'}"
