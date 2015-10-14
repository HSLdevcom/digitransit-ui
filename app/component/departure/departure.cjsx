React             = require 'react'
cx                = require 'classnames'
RouteNumber       = require './route-number'
RouteDestination  = require './route-destination'
DepartureTime     = require './departure-time'
StopReference     = require '../stop/stop-reference'

Departure = (props) ->
  stopReference = <span/>
  mode = props.departure.pattern.route.type.toLowerCase()

  if props.showStop
    stopReference = <StopReference
      mode={mode}
      code={props.departure.stop.code} />

  <p className={cx 'departure', 'route-detail-text', props.className}>
    <DepartureTime
      departureTime={props.departure.stoptime}
      realtime={props.departure.realtime}
      currentTime={props.currentTime}/>
    <RouteNumber
      mode={mode}
      text={props.departure.pattern.route.shortName} />
    <RouteDestination
      mode={mode}
      destination={props.departure.pattern.headsign or props.departure.pattern.route.longName} />
    {stopReference}
  </p>

Departure.description =
  "Display a departure row using react components"

Departure.propTypes =
  departure: React.PropTypes.object.isRequired
  showStop: React.PropTypes.bool
  currentTime: React.PropTypes.number.isRequired
  className: React.PropTypes.string

Departure.displayName = "Departure"

module.exports = Departure
