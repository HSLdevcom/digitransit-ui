React         = require 'react'
moment        = require 'moment'
Icon          = require '../icon/icon.cjsx'
cx            = require 'classnames'
RouteNumber   = require './route-number'


class Departure extends React.Component
  renderTime: (departure) ->
    if departure.stoptime < @props.currentTime # In the past
      return (if departure.realtime then "" else "~") + moment(departure.stoptime * 1000).format "HH:mm"
    if departure.stoptime > @props.currentTime + 1200 # far away
      return (if departure.realtime then "" else "~") + moment(departure.stoptime * 1000).format "HH:mm"
    else
      return (if departure.realtime then "" else "~") + moment(departure.stoptime * 1000).diff(@props.currentTime * 1000, 'm') + "min"

  render: ->
    mode = @props.departure.pattern.route.type.toLowerCase()
    <p className={cx 'departure', 'route-detail-text', @props.className}>
      <span className="time">{@renderTime @props.departure}</span>
      <RouteNumber
        mode={mode}
        shortName={@props.departure.pattern.route.shortName} />
      <Icon className={mode} img='icon-icon_arrow-right'/>
      <span className="destination">&nbsp;{@props.departure.pattern.headsign or @props.departure.pattern.route.longName}</span>
    </p>

module.exports = Departure
