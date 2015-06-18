React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
#ItineraryTabs      = require '../component/route/route-tabs'
Tabs               = require 'react-simpletabs'
Map                = require '../component/map/map'
RouteInformationAction = require '../action/route-information-action'
RouteHeaderContainer = require '../component/route/route-header-container'
RouteStopListContainer = require '../component/route/route-stop-list-container'
RouteMapContainer  = require '../component/route/route-map-container'
RealTimeClient     = require '../action/real-time-client-action'
ItineraryLine      = require '../component/map/itinerary-line'

class RoutePage extends React.Component
  @loadAction: RouteInformationAction.routePageDataRequest

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    route = @props.params.routeId.split(':')
    if route[0].toLowerCase() == 'hsl'
      @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2]}

  componentWillUnmount: ->
    client = @context.getStore('RealTimeInformationStore').client
    if client
      @context.executeAction RealTimeClient.stopRealTimeClient, client

  componentWillReceiveProps: (newProps) ->
    route = newProps.params.routeId.split(':')
    client = @context.getStore('RealTimeInformationStore').client
    if client
      if route[0].toLowerCase() == 'hsl'
        @context.executeAction RealTimeClient.updateTopic,
          client: client
          oldTopics: @context.getStore('RealTimeInformationStore').getSubscriptions()
          newTopic: {route: route[1], direction: route[2]}
      else
        @componentWillUnmount()
    else
      if route[0].toLowerCase() == 'hsl'
        @context.executeAction RealTimeClient.startRealTimeClient, {route: route[1], direction: route[2]}

  render: ->
    <DefaultNavigation className="fullscreen">
      <RouteHeaderContainer id={@props.params.routeId}/>
      <Tabs className="route-tabs">
        <Tabs.Panel title="Pysäkit">
          <RouteStopListContainer id={@props.params.routeId}/>
        </Tabs.Panel>
        <Tabs.Panel title="Kartta" className="fullscreen">
          <RouteMapContainer id={@props.params.routeId}/>
        </Tabs.Panel>
        <Tabs.Panel title="Aikataulut">
          Aikataulut tähän
        </Tabs.Panel>
      </Tabs>
    </DefaultNavigation>

module.exports = RoutePage