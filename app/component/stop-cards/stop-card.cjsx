React                 = require 'react'
StopCardHeader        = require './stop-card-header'
Link                  = require 'react-router/lib/Link'

class StopCard extends React.Component
  render: ->
    if !@props.stop || !@props.children || @props.children.length == 0
      return false

    <div className="small-12 medium-6 large-4 columns">
      <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}" className="no-decoration">
        <div className="card padding-small cursor-pointer">
          <StopCardHeader
            stop={@props.stop}
            favourite={@props.favourite}
            addFavouriteStop={@props.addFavouriteStop}
            distance={@props.distance}
          />
          {@props.children}
        </div>
      </Link>
    </div>


module.exports = StopCard
