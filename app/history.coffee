{createHistory}    = require 'history'
{useRouterHistory} = require 'react-router'
config             = require './config'

isBrowser = window?

module.exports = useRouterHistory(createHistory)({
  basename: config.APP_PATH,
}) if isBrowser
