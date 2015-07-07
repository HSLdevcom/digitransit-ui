React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
NavigationMap      = require '../component/map/navigation-map'

class NavigationPage extends React.Component
  render: ->
    <DefaultNavigation className="fullscreen">
      <NavigationMap hash={parseInt(@props.params.hash)}/>
    </DefaultNavigation>

module.exports = NavigationPage
