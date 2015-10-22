React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
NavigationMap      = require '../component/map/navigation-map'

class NavigationPage extends React.Component
  render: ->

    # The hash describes the selected itinerary, currently just the index in OTP response
    <DefaultNavigation className="fullscreen">
      <NavigationMap hash={parseInt(@props.params.hash)}/>
    </DefaultNavigation>



module.exports = NavigationPage
