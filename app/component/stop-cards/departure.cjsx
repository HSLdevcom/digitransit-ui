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
    <p className="transport">
      <span className="next-departure">{@renderTime @props.time}</span>
      <Icon className={@props.mode} img={'icon-icon_' + @props.mode + '-withoutBox'}/>
      <span className={"vehicle-number " + @props.mode}>{@props.routeShortName}</span>
      <Icon className={@props.mode} img='icon-icon_arrow-right'/>
      <span className="destination">{@props.destination}</span>
    </p>
  
module.exports = Departure