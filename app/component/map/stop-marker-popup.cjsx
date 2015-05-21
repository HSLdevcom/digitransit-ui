React                 = require 'react'
StopCardHeader        = require '../stop-cards/stop-card-header'
Icon                  = require '../icon/icon.cjsx'

class StopMarkerPopup extends React.Component
  render: ->
    <div className="stop-card popup">
      <StopCardHeader stop={@props.stop} favourite={@props.favourite} addFavouriteStop={@props.addFavouriteStop}/>
      <div className="bottom location">
        <span><Icon img={'icon-icon_time'} className="cursor-pointer">Näytä lähdöt</Icon></span>
        <span className="route"><Icon img={'icon-icon_route'} className="cursor-pointer">Reititä tänne</Icon></span>
      </div>
    </div>

module.exports = StopMarkerPopup