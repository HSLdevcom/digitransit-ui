React                  = require 'react'
Relay                  = require 'react-relay'
queries                = require '../queries'
DefaultNavigation      = require '../component/navigation/default-navigation'
RouteHeaderContainer   = require '../component/route/route-header-container'
RouteListHeader             = require '../component/route/route-list-header'
TripStopListContainer  = require '../component/trip/trip-stop-list-container'
RouteMapContainer      = require '../component/route/route-map-container'
RealTimeClient         = require '../action/real-time-client-action'

class TripMapPage extends React.Component
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

  getStartTime: (time) ->
    hours = ('0' + Math.floor(time / 60 / 60 )).slice(-2)
    mins = ('0' + (time / 60 % 60)).slice(-2)
    return hours + mins

  render: ->
    trip = @getStartTime(@props.trip.stoptimes[0].scheduledDeparture)

    <DefaultNavigation className="fullscreen trip-map">
      <RouteHeaderContainer className="trip-header" pattern={@props.trip.pattern} trip={trip}/>
      <RouteMapContainer className="fullscreen" pattern={@props.trip.pattern} trip={trip} tripId={@props.trip.gtfsId} fullscreen={true}/>
    </DefaultNavigation>

module.exports = Relay.createContainer(TripMapPage, fragments: queries.TripPageFragments)
