React                 = require 'react'
StopCardHeader        = require './stop-card-header'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'

class StopCard extends React.Component
  render: ->
    if !@props.stop || !@props.children || @props.children.length == 0
      return false

    <Link to="/pysakit/#{@props.stop.gtfsId}" className="no-decoration">
      <div className={cx "card", "cursor-pointer", @props.className}>
        <StopCardHeader
          stop={@props.stop}
          favourite={@props.favourite}
          addFavouriteStop={@props.addFavouriteStop}
          distance={@props.distance}
        />
        {@props.children}
      </div>
    </Link>


module.exports = StopCard
