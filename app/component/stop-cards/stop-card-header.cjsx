React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'


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

    if @props.infoIcon
      info = <Link to="stopInfo" params={{stopId: @props.stop.id}}>
          <span className="cursor-pointer">
            <Icon className="info" img="icon-icon_plus"/>
          </span>
        </Link>
    else
      info = ""

    <div className={"stop-card-header" + (if @props.className then " " + @props.className else "")}>
      <span className="cursor-pointer" onClick={@props.addFavouriteStop}>
        <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
      </span>
      {info}
      <h3>{@props.stop.name} ›</h3>
      <p className="location">{description}</p>
    </div>

module.exports = StopCardHeader