React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
StopCardContainer     = require('../../stop-cards/StopCardContainer').default
MarkerPopupBottom     = require '../marker-popup-bottom'

class StopMarkerPopup extends React.Component
  render: ->
    stop = @props.stop or @props.terminal

    <div className="card">
      <StopCardContainer
        stop={stop}
        departures={5}
        date={@props.relay.variables.date}
        className="padding-small cursor-pointer"/>
      <MarkerPopupBottom location={{
        address: stop.name
        lat: stop.lat
        lon: stop.lon
      }}/>
    </div>

module.exports = Relay.createContainer StopMarkerPopup,
  fragments: queries.StopMarkerPopupFragments
  initialVariables:
    date: null
