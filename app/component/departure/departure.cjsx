React             = require 'react'
cx                = require 'classnames'
RouteNumber       = require './route-number'
RouteDestination  = require './route-destination'
DepartureTime     = require './departure-time'
StopReference     = require '../stop/stop-reference'
ComponentUsageExample = require '../documentation/component-usage-example'
Example = require '../documentation/example-data'

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
      currentTime={props.currentTime}
      canceled={props.canceled} />
    <RouteNumber
      mode={mode}
      realtime={props.departure.realtime}
      text={props.departure.pattern.route.shortName} />
    <RouteDestination
      mode={mode}
      destination={props.departure.pattern.headsign or props.departure.pattern.route.longName} />
    {stopReference}
  </p>

Departure.description =
  <div>
    <p>Display a departure row using react components</p>
    <ComponentUsageExample>
      <Departure departure={Example.realtimeDeparture} currentTime={Example.currentTime}/>
    </ComponentUsageExample>
    <ComponentUsageExample description="adding padding classes">
      <Departure departure={Example.departure} currentTime={Example.currentTime} className="padding-normal padding-bottom"/>
    </ComponentUsageExample>
    <ComponentUsageExample description="with stop number">
      <Departure departure={Example.departure} showStop={true} currentTime={Example.currentTime} className="padding-normal padding-bottom"/>
    </ComponentUsageExample>
  </div>


Departure.propTypes =
  departure: React.PropTypes.object.isRequired
  showStop: React.PropTypes.bool
  currentTime: React.PropTypes.number.isRequired
  className: React.PropTypes.string

Departure.displayName = "Departure"

module.exports = Departure
