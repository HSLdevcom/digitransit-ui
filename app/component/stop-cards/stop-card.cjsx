React                 = require 'react'
StopCardHeader        = require './stop-card-header'
Link                  = require 'react-router/lib/components/Link'

class StopCard extends React.Component
  render: ->
    if !@props.stop || !@props.children || @props.children.length == 0
      return false

    <div className="small-12 medium-6 large-4 columns">
      <Link to="stop" params={{stopId: @props.stop.id}}>
        <div className="stop-card cursor-pointer">
          <StopCardHeader stop={@props.stop} favourite={@props.favourite} addFavouriteStop={@props.addFavouriteStop} dist={@props.dist}/>
          {@props.children}
        </div>
      </Link>
    </div>

module.exports = StopCard
