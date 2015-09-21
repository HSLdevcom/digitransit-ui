React                  = require 'react'
Relay                  = require 'react-relay'
queries                = require '../queries'
DefaultNavigation      = require '../component/navigation/default-navigation'
Tabs                   = require 'react-simpletabs'
RouteListHeader        = require '../component/route/route-list-header'
RouteHeaderContainer   = require '../component/route/route-header-container'
RouteStopListContainer = require '../component/route/route-stop-list-container'
RouteMapContainer      = require '../component/route/route-map-container'
RealTimeClient         = require '../action/real-time-client-action'

class RoutePage extends React.Component
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
      <RouteHeaderContainer route={@props.route}/>
      <Tabs className="route-tabs">
        <Tabs.Panel title="Pysäkit">
          <RouteListHeader
            headers={["Juuri Nyt", "Pysäkki", "Pysäkkinumero", "Min"]}
            columnClasses={["small-3 route-stop-now", "small-6 route-stop-name", "small-2 route-stop-code", "small-1 route-stop-mins"]}
          />
          <RouteStopListContainer route={@props.route}/>
        </Tabs.Panel>
        <Tabs.Panel title="Kartta" className="fullscreen">
          <RouteMapContainer route={@props.route} className="fullscreen"/>
        </Tabs.Panel>
        <Tabs.Panel title="Aikataulut">
          <div>Aikataulut tähän</div>
        </Tabs.Panel>
      </Tabs>
    </DefaultNavigation>

module.exports = Relay.createContainer(RoutePage, fragments: queries.RoutePageFragments)
