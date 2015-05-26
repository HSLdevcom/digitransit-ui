React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'

class StopCardHeader extends React.Component
  render: ->
    if !@props.stop
      return false

    description = ""
    if @props.stop.desc
      description += @props.stop.desc + " // "
    if @props.stop.code
      description += @props.stop.code + " // "
    if @props.dist
      description += @props.dist + " m"

    <div className={"stop-card-header" + (if @props.className then " " + @props.className else "")}>
      <span className="cursor-pointer" onClick={@props.addFavouriteStop}>
        <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
      </span>
      <h3>{@props.stop.name} ›</h3>
      <p className="location">{description}</p>
    </div>

module.exports = StopCardHeader