React                  = require 'react'
Relay                  = require 'react-relay'
queries                = require '../queries'
DefaultNavigation      = require '../component/navigation/default-navigation'
RouteHeaderContainer   = require '../component/route/route-header-container'
RouteStopListContainer = require '../component/route/route-stop-list-container'
RouteListHeader             = require '../component/route/route-list-header'
TripStopListContainer  = require '../component/trip/trip-stop-list-container'
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
    hours = ('0' + Math.floor(time / 60 / 60 )).slice(-2)
    mins = ('0' + (time / 60 % 60)).slice(-2)
    return hours + mins

  render: ->
    trip = @getStartTime(@props.trip.stoptimes[0].scheduledDeparture)

    <DefaultNavigation className="fullscreen trip">
      <RouteHeaderContainer className="trip-header" route={@props.trip.pattern} trip={trip}/>
      <RouteMapContainer className="map-small" route={@props.trip.pattern} trip={trip} tripId={@props.trip.gtfsId}/>
      <RouteListHeader
        headers={["Aika", "Pysäkki", "Pysäkkinumero"]}
        columnClasses={["small-3 route-stop-now", "small-7 route-stop-name", "small-2 route-stop-code"]}
       />
      <TripStopListContainer className="below-map" trip={@props.trip}/>
    </DefaultNavigation>

module.exports = Relay.createContainer(TripPage, fragments: queries.TripPageFragments)
