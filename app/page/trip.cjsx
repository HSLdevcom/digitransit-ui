React                  = require 'react'
Relay                  = require 'react-relay'
queries                = require '../queries'
DefaultNavigation      = require '../component/navigation/default-navigation'
RouteHeaderContainer   = require '../component/route/route-header-container'
RouteStopListContainer = require '../component/route/route-stop-list-container'
RouteMapContainer      = require '../component/route/route-map-container'
RealTimeClient         = require '../action/real-time-client-action'

class TripPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    route = @props.trip.pattern.code.split(':')
    if route[0].toLowerCase() == 'hsl'
      trip = @getStartTime(@props.trip.stoptimes[0].scheduledDeparture)
      @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2], trip: trip}

  componentWillUnmount: ->
    client = @context.getStore('RealTimeInformationStore').client
    if client
      @context.executeAction RealTimeClient.stopRealTimeClient, client

  componentWillReceiveProps: (newProps) ->
    route = newProps.trip.pattern.code.split(':')
    client = @context.getStore('RealTimeInformationStore').client
    if client
      if route[0].toLowerCase() == 'hsl'
        @getStartTime(@props.trip.stoptimes[0].scheduledDeparture)
        @context.executeAction RealTimeClient.updateTopic,
          client: client
          oldTopics: @context.getStore('RealTimeInformationStore').getSubscriptions()
          newTopic: {route: route[1], direction: route[2], trip: trip}
      else
        @componentWillUnmount()
    else
      if route[0].toLowerCase() == 'hsl'
        @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2]}

  getStartTime: (time) ->
    trip = "" + Math.floor(time / 60 / 60 ) + time / 60 % 60

  render: ->
    trip = @getStartTime(@props.trip.stoptimes[0].scheduledDeparture)
    <DefaultNavigation className="fullscreen">
      <RouteHeaderContainer route={@props.trip.pattern} trip={trip}/>
      <RouteMapContainer route={@props.trip.pattern} trip={trip}/>
      <RouteStopListContainer route={@props.trip.pattern}/>
    </DefaultNavigation>

module.exports = Relay.createContainer(TripPage, fragments: queries.TripPageFragments)
