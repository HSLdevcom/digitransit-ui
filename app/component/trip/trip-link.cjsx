React = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Link                  = require 'react-router/lib/Link'
Icon                  = require '../icon/icon'

class TripLink extends React.Component

  render: ->
    <Link key={@props.trip.fuzzyTrip.gtfsId} to="#{process.env.ROOT_PATH}lahdot/#{@props.trip.fuzzyTrip.gtfsId}">
      <Icon className={@props.trip.fuzzyTrip.route.type.toLowerCase()} img={'icon-icon_' + @props.trip.fuzzyTrip.route.type.toLowerCase()}/>
    </Link>

module.exports = Relay.createContainer(TripLink,
  fragments: queries.TripLinkFragments
  initialVariables:
    route: null
    direction: null
    date: null
    time: null
)
