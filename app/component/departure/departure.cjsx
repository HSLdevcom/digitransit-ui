React             = require 'react'
cx                = require 'classnames'
RouteNumber       = require './route-number'
RouteDestination  = require './route-destination'
DepartureTime     = require './departure-time'

class Departure extends React.Component


  render: ->
    mode = @props.departure.pattern.route.type.toLowerCase()
    <p className={cx 'departure', 'route-detail-text', @props.className}>
      <DepartureTime
        time={@props.departure.stoptime}
        realtime={@props.departure.realtime}
        currentTime={@props.currentTime}/>
      <RouteNumber
        mode={mode}
        text={@props.departure.pattern.route.shortName} />
      <RouteDestination
        mode={mode}
        destination={@props.departure.pattern.headsign or @props.departure.pattern.route.longName}
       />
    </p>

module.exports = Departure
