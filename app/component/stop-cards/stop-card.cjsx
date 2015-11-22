React                 = require 'react'
StopCardHeader        = require './stop-card-header'
Link                  = require 'react-router/lib/Link'
Card                  = require '../card/card'

class StopCard extends React.Component


  getContent: =>

    <Card className={@props.className}>
      <StopCardHeader
        stop={@props.stop}
        favourite={@props.favourite}
        addFavouriteStop={@props.addFavouriteStop}
        distance={@props.distance}
      />
      {@props.children}
    </Card>

  render: ->
    if !@props.stop || !@props.children || @props.children.length == 0
      return false

    <Link to="/pysakit/#{@props.stop.gtfsId}" className="no-decoration">
      {@getContent()}
    </Link>


module.exports = StopCard
