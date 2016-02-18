React                  = require 'react'
DefaultNavigation      = require '../component/navigation/default-navigation'

class LoadingPage extends React.Component
  render: ->
    <DefaultNavigation className="fullscreen">
      <div className="spinner-loader"/>
    </DefaultNavigation>


module.exports = LoadingPage
