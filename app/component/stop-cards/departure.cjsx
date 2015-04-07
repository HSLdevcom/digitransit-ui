React = require 'react'

class Departure extends React.Component
  render: ->
    <p className="transport">
      <span className="next-departure">{@props.times[0]}</span>
      <span className="following-departure">{@props.times[1]}</span>
      <i className={"icon icon-" + @props.mode + " " + @props.mode}></i>
      <span className={"vehicle-number " + @props.mode}>{@props.routeShortName}</span>
      <i className={"icon icon-arrow-right " + @props.mode}></i>
      <span className="destination">{@props.destination}</span>
    </p>
  
module.exports = Departure