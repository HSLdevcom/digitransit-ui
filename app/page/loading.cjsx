React             = require 'react'
Config            = require '../config'
DefaultNavigation = require('../component/navigation/DefaultNavigation').default

class LoadingPage extends React.Component
  render: ->
    <DefaultNavigation className="fullscreen" title={Config.title}>
      <div className="spinner-loader"/>
    </DefaultNavigation>


module.exports = LoadingPage
