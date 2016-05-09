React                  = require 'react'
Relay                  = require 'react-relay'
queries                = require '../queries'
DefaultNavigation      = require('../component/navigation/default-navigation').default
RouteHeaderContainer   = require '../component/route/route-header-container'
RouteListHeader        = require '../component/route/route-list-header'
TripStopListContainer  = require '../component/trip/trip-stop-list-container'
RouteMapContainer      = require '../component/route/route-map-container'
RealTimeClient         = require '../action/real-time-client-action'
timeUtils              = require '../util/time-utils'

class TripMapPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    route = @props.trip.pattern.code.split(':')
    if route[0].toLowerCase() == 'hsl'
      tripStarTtime = timeUtils.getStartTime(@props.trip.stoptimes[0].scheduledDeparture)
      @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2], tripStarTtime: tripStarTtime}

  componentWillUnmount: ->
    client = @context.getStore('RealTimeInformationStore').client
    if client
      @context.executeAction RealTimeClient.stopRealTimeClient, client

  render: ->
    tripStarTtime = timeUtils.getStartTime(@props.trip.stoptimes[0].scheduledDeparture)

    <DefaultNavigation className="fullscreen trip-map">
      <RouteHeaderContainer className="trip-header" pattern={@props.trip.pattern} trip={tripStarTtime}/>
      <RouteMapContainer className="fullscreen" pattern={@props.trip.pattern} trip={tripStarTtime} tripId={@props.trip.gtfsId} fullscreen={true}/>
    </DefaultNavigation>

module.exports = Relay.createContainer(TripMapPage, fragments: queries.TripPageFragments)
