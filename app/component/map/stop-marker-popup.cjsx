React                 = require 'react'
StopCardHeader        = require '../stop-cards/stop-card-header'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'

class StopMarkerPopup extends React.Component
  render: ->
    <div className="stop-card popup">
      <StopCardHeader stop={@props.stop} favourite={@props.favourite} addFavouriteStop={@props.addFavouriteStop}/>
      {#<LineList>}
      <div className="bottom location">
        <Link to="stop" params={{stopId: @props.stop.id}}><Icon img={'icon-icon_time'}>Näytä lähdöt</Icon></Link>
        <Link to="itineraryList" params={{to: "#{@props.stop.name}::#{@props.stop.lat},#{@props.stop.lon}", from: @props.getFrom()}} className="route"><Icon img={'icon-icon_route'}>Reititä tänne</Icon></Link>
      </div>
    </div>

module.exports = StopMarkerPopup