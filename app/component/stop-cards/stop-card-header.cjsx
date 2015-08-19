React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
Link                  = require('react-router/lib/Link').Link


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
      info = <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.stop.id}/info">
          <span className="cursor-pointer">
            <Icon className="info" img="icon-icon_info"/>
          </span>
        </Link>
    else
      info = ""

    # We use onClick in the following, as it is rendered sometimes in a popup, in which the touch tap event does not fire (as it is part of another react render)

    <div className={"stop-card-header" + (if @props.className then " " + @props.className else "")}>
      <span className="cursor-pointer favourite-icon" onClick={@props.addFavouriteStop}>
        <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
      </span>
      {info}
      <h3>{@props.stop.name} ›</h3>
      <p className="location">{description}</p>
    </div>

module.exports = StopCardHeader
