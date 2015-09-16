React  = require 'react'
moment = require 'moment'
Icon   = require '../icon/icon.cjsx'
cx     = require 'classnames'

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
    <p className={cx 'transport', 'route-detail-text', @props.className}>
      <span className="time">{@renderTime @props.departure}</span>
      <Icon className={mode} img={'icon-icon_' + mode }/>
      <span className={(if @props.departure.pattern.route.shortName then "vehicle-number " else "") + mode}>{@props.departure.pattern.route.shortName}</span>
      <Icon className={mode} img='icon-icon_arrow-right'/>
      <span className="destination">&nbsp;{@props.departure.pattern.headsign or @props.departure.pattern.route.longName}</span>
    </p>

module.exports = Departure
