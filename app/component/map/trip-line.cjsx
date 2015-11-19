React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
RouteLine               = require './route-line'

class TripLine extends React.Component
  render: ->
    <RouteLine map={@props.map}
               pattern={@props.pattern?.pattern or null}
               thin=true
               filteredStops={@props.filteredStops} />


module.exports = Relay.createContainer(TripLine, fragments: queries.TripPatternFragments)
