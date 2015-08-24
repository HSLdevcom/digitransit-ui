React  = require 'react'
moment = require 'moment'
Icon   = require '../icon/icon.cjsx'

class Departure extends React.Component
  renderTime: (departure) ->
    now = moment();
    if (departure.stoptime.isBefore(now)) # In the past
      return (if departure.realtime then "" else "~") + departure.stoptime.format "HH:mm"
    if (departure.stoptime.diff(now, 'm') > 20) # far away
      return (if departure.realtime then "" else "~") + departure.stoptime.format "HH:mm"
    else
      return (if departure.realtime then "" else "~") + departure.stoptime.diff(now, 'm') + "min"

  render: ->
    mode = @props.departure.pattern.route.type.toLowerCase()
    <p className="transport">
      <span className="next-departure">{@renderTime @props.departure}</span>
      <Icon className={mode} img={'icon-icon_' + mode }/>
      <span className={(if @props.departure.pattern.route.shortName then "vehicle-number " else "") + mode}>&nbsp;{@props.departure.pattern.route.shortName}</span>
      <Icon className={mode} img='icon-icon_arrow-right'/>
      <span className="destination">&nbsp;{@props.departure.pattern.direction or @props.departure.pattern.route.longName}</span>
    </p>

module.exports = Departure
