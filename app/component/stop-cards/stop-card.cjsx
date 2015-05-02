React                 = require 'react'
FavouriteStopsActions = require '../../action/favourite-stops-action'
Icon                  = require '../icon/icon.cjsx'

class StopCard extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func

  addFavouriteStop: () =>
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

    if !@props.children || @props.children.length == 0
      return false

    <div className="small-12 medium-6 large-4 columns">
      <div className="stop-card cursor-pointer" onClick={() => @context.router.transitionTo('/pysakit/' + @props.stop.id)}>  
        <span className="cursor-pointer" onClick={@addFavouriteStop}>
          <Icon className={"favourite" + (if @props.favourite then " selected" else "")} img="icon-icon_star"/>
        </span>
        <h3>{@props.stop.name} ›</h3>
        <p className="location">{description}</p>
        {@props.children}
      </div>
    </div>

module.exports = StopCard