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
FormattedMessage       = require('react-intl').FormattedMessage
NotImplementedAction   = require '../action/not-implemented-action'
NotFound               = require './404.cjsx'


class RoutePage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

   @propTypes:
     pattern: React.PropTypes.node.isRequired

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

  before: (i) =>
    if i == 3 #tab 3==timetable selected
      @context.executeAction NotImplementedAction.click, name: <FormattedMessage id='timetable' defaultMessage='Timetable' />
      false

  render: ->
    if @props.pattern == null
      <NotFound/>
    else
      <DefaultNavigation className="fullscreen">
       <RouteHeaderContainer pattern={@props.pattern}/>
        <Tabs className="route-tabs" onBeforeChange={@before}>
          <Tabs.Panel title={<FormattedMessage id='stops' defaultMessage='Stops' />}>
            <RouteListHeader/>
            <RouteStopListContainer pattern={@props.pattern}/>
          </Tabs.Panel>
          <Tabs.Panel title={<FormattedMessage id='map' defaultMessage='Map' />} className="fullscreen">
            <RouteMapContainer pattern={@props.pattern} className="fullscreen"/>
          </Tabs.Panel>
          <Tabs.Panel title={<FormattedMessage id='timetable' defaultMessage='Timetable' />}>
            <div>Aikataulut tähän</div>
          </Tabs.Panel>
        </Tabs>
      </DefaultNavigation>


module.exports = Relay.createContainer(RoutePage, fragments: queries.RoutePageFragments)
