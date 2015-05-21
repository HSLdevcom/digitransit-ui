React                 = require 'react'
StopCardHeader        = require '../stop-cards/stop-card-header'

class StopMarkerPopup extends React.Component
  render: ->
    <div className="stop-card popup">
      <StopCardHeader stop={@props.stop} favourite={@props.favourite} addFavouriteStop={@props.addFavouriteStop}/>
    </div>

module.exports = StopMarkerPopup