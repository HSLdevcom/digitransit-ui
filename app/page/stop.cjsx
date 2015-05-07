React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
StopCardContainer  = require '../component/stop-cards/stop-card-container'

Page = React.createClass
  render: ->
    <DefaultNavigation>
      <Map/>
      <StopCardContainer stop={@props.params.stopId}/>
    </DefaultNavigation>

module.exports = Page