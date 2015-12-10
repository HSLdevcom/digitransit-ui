# This is server render. Return correct config file.
module.exports = require "./config.#{process.env.CONFIG or 'default'}"
