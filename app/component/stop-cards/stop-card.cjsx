React                 = require 'react'
FavouriteStopsActions = require '../../action/favourite-stops-action'
Icon                  = require '../icon/icon.cjsx'
StopCardHeader        = require './stop-card-header'

class StopCard extends React.Component
  @contextTypes:
    router: React.PropTypes.func

  render: ->
    if !@props.stop || !@props.children || @props.children.length == 0
      return false

    <div className="small-12 medium-6 large-4 columns">
      <div className="stop-card cursor-pointer" onClick={() => @context.router.transitionTo('stop', { stopId: @props.stop.id})}>  
        <StopCardHeader stop=@props.stop />
        {@props.children}
      </div>
    </div>

module.exports = StopCard