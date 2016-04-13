{createHistory}    = require 'history'
{useRouterHistory} = require 'react-router'
config               = require './config'

module.exports = useRouterHistory(createHistory)({
  basename: config.APP_PATH,
})
