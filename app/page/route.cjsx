React                  = require 'react'
Relay                  = require 'react-relay'
Helmet                 = require 'react-helmet'
queries                = require '../queries'
DefaultNavigation      = require('../component/navigation/DefaultNavigation').default
Tabs                   = require 'react-simpletabs'
RouteListHeader        = require '../component/route/route-list-header'
RouteHeaderContainer   = require '../component/route/route-header-container'
RouteStopListContainer = require('../component/route/RouteStopListContainer').default
RouteMapContainer      = require('../component/route/RouteMapContainer').default
RouteScheduleContainer = require('../component/route/RouteScheduleContainer').default
RealTimeClient         = require '../action/real-time-client-action'
FormattedMessage       = require('react-intl').FormattedMessage
NotImplementedAction   = require '../action/not-implemented-action'
NotFound               = require './404'
intl                   = require 'react-intl'

class RoutePage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

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

  render: ->
    if @props.pattern == null
      <NotFound/>
    else
      params =
        route_short_name: @props.pattern.route.shortName
        route_long_name: @props.pattern.route.longName

      title = @context.intl.formatMessage {id: 'route-page.title', defaultMessage: 'Route {route_short_name}'}, params
      meta =
        title: title
        meta: [
          {name: 'description', content: @context.intl.formatMessage {id: 'route-page.description', defaultMessage: 'Route {route_short_name} - {route_long_name}'}, params}
        ]

      <DefaultNavigation className="fullscreen" title={title}>
        <Helmet {...meta} />
        <RouteHeaderContainer pattern={@props.pattern}/>
        <Tabs className="route-tabs">
          <Tabs.Panel title={<FormattedMessage id='stops' defaultMessage='Stops' />}>
            <RouteListHeader/>
            <RouteStopListContainer pattern={@props.pattern}/>
          </Tabs.Panel>
          <Tabs.Panel title={<FormattedMessage id='map' defaultMessage='Map' />} className="fullscreen">
            <RouteMapContainer pattern={@props.pattern} className="fullscreen"/>
          </Tabs.Panel>
          <Tabs.Panel title={<FormattedMessage id='timetable' defaultMessage='Timetable' />}>
            <RouteScheduleContainer pattern={@props.pattern} />
          </Tabs.Panel>
        </Tabs>
      </DefaultNavigation>


module.exports = Relay.createContainer(RoutePage, fragments: queries.RoutePageFragments)
