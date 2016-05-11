React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
StopCardContainer     = require '../../stop-cards/stop-card-container'
MarkerPopupBottom     = require '../marker-popup-bottom'

class StopMarkerPopup extends React.Component
  render: ->
    <div className="card">
      <StopCardContainer
        stop={@props.stop}
        departures={5}
        date={@props.relay.variables.date}
        className="padding-small cursor-pointer"/>
      <MarkerPopupBottom location={{
        address: @props.stop.name
        lat: @props.stop.lat
        lon: @props.stop.lon
      }}/>
    </div>


module.exports = Relay.createContainer StopMarkerPopup,
  fragments: queries.StopMarkerPopupFragments
  initialVariables:
    date: null
