React  = require 'react'
moment = require 'moment'
Icon   = require '../icon/icon.cjsx'

class Departure extends React.Component
  renderTime: (time) ->
    if (time == undefined)
      return <span>---</span>
    now = moment() / 1000;
    departureTime = time.serviceDay + time.realtimeDeparture
    if (departureTime - now <= 0) # In the past
      return (if time.realtime then "" else "~") + moment(departureTime * 1000).format("HH:mm")
    if (departureTime - now > 20 * 60) # far away
      return (if time.realtime then "" else "~") + moment(departureTime * 1000).format("HH:mm")
    else
      return (if time.realtime then "" else "~") + ((departureTime - now) / 60 | 0) + "min"

  render: ->
    mode = @props.departure.pattern.mode.toLowerCase()
    <p className="transport">
      <span className="next-departure">{@renderTime @props.departure.time}</span>
      <Icon className={mode} img={'icon-icon_' + mode }/>
      <span className={(if @props.departure.pattern.shortName then "vehicle-number " else "") + mode}>&nbsp;{@props.departure.pattern.shortName}</span>
      <Icon className={mode} img='icon-icon_arrow-right'/>
      <span className="destination">&nbsp;{@props.departure.pattern.direction or @props.departure.pattern.longName}</span>
    </p>
  
module.exports = Departure