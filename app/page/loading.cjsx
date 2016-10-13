React             = require 'react'
Config            = require('../config').default
DefaultNavigation = require('../component/navigation/DefaultNavigation').default

class LoadingPage extends React.Component
  render: ->
    <div className="spinner-loader"/>


module.exports = LoadingPage
