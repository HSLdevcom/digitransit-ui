React                 = require 'react'
FavouriteStopsActions = require '../../action/favourite-stops-action'
Icon                  = require '../icon/icon.cjsx'

class StopCardHeader extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  addFavouriteStop: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteStopsActions.addFavouriteStop, @props.stop.id

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

    <div>
      <span className="cursor-pointer" onClick={@addFavouriteStop}>
        <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
      </span>
      <h3>{@props.stop.name} ›</h3>
      <p className="location">{description}</p>
    </div>

module.exports = StopCardHeader