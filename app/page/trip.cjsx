React                  = require 'react'
Relay                  = require 'react-relay'
Helmet                 = require 'react-helmet'
queries                = require '../queries'
DefaultNavigation      = require '../component/navigation/default-navigation'
RouteHeaderContainer   = require '../component/route/route-header-container'
TripListHeader         = require '../component/trip/trip-list-header'
TripStopListContainer  = require '../component/trip/trip-stop-list-container'
RouteMapContainer      = require '../component/route/route-map-container'
RealTimeClient         = require '../action/real-time-client-action'
FormattedMessage       = require('react-intl').FormattedMessage
timeUtils              = require '../util/time-utils'
intl               = require 'react-intl'

class TripPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: ->
    route = @props.trip.pattern.code.split(':')
    if route[0].toLowerCase() == 'hsl'
      tripStartTime = timeUtils.getStartTime(@props.trip.stoptimes[0].scheduledDeparture)
      @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2], tripStartTime: tripStartTime}

  componentWillUnmount: ->
    client = @context.getStore('RealTimeInformationStore').client
    if client
      @context.executeAction RealTimeClient.stopRealTimeClient, client

  componentWillReceiveProps: (newProps) ->
    route = newProps.trip.pattern.code.split(':')
    client = @context.getStore('RealTimeInformationStore').client
    if client
      if route[0].toLowerCase() == 'hsl'
        tripStartTime = timeUtils.getStartTime(newProps.trip.stoptimes[0].scheduledDeparture)
        @context.executeAction RealTimeClient.updateTopic,
          client: client
          oldTopics: @context.getStore('RealTimeInformationStore').getSubscriptions()
          newTopic: {route: route[1], direction: route[2], tripStartTime: tripStartTime}
      else
        @componentWillUnmount()
    else
      if route[0].toLowerCase() == 'hsl'
        tripStartTime = timeUtils.getStartTime(newProps.trip.stoptimes[0].scheduledDeparture)
        @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2], tripStartTime: tripStartTime}

  render: ->
    tripStartTime = timeUtils.getStartTime(@props.trip.stoptimes[0].scheduledDeparture)

    params =
      route_short_name: @props.trip.pattern.route.shortName
      route_long_name: @props.trip.pattern.route.longName

    meta =
      title: @context.intl.formatMessage {id: 'trip-page.title', defaultMessage: 'Route {route_short_name}'}, params
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'trip-page.description', defaultMessage: 'Route {route_short_name} - {route_long_name}'}, params}
      ]

    <DefaultNavigation className="fullscreen trip">
      <Helmet {...meta} />
      <RouteHeaderContainer className="trip-header" pattern={@props.trip.pattern} trip={tripStartTime}/>
      <RouteMapContainer className="map-small" pattern={@props.trip.pattern} trip={tripStartTime} tripId={@props.trip.gtfsId}/>
      <TripListHeader/>
      <TripStopListContainer className="below-map" trip={@props.trip}/>
    </DefaultNavigation>

module.exports = Relay.createContainer(TripPage, fragments: queries.TripPageFragments)
