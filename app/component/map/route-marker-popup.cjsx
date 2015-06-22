React                 = require 'react'
RouteHeader           = require '../route/route-header'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'
FavouriteStopsAction  = require '../../action/favourite-stops-action'
GtfsUtils             = require '../../util/gtfs'
FavouriteRoutesActions = require '../../action/favourite-routes-action'


class RouteMarkerPopup extends React.Component
  @childContextTypes:
    router: React.PropTypes.func.isRequired

  getChildContext: () ->
    router: @props.context.router

  componentDidMount: -> 
    @props.context.getStore('RouteInformationStore').addChangeListener @onChange
    @props.context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @props.context.getStore('RouteInformationStore').removeChangeListener @onChange
    @props.context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  onChange: (id) =>
    if !id or id.split(':',2).join(':') == @props.message.route or id == @props.message.route
      @forceUpdate()

  addFavouriteRoute: (e) =>
    e.stopPropagation()
    @props.context.executeAction FavouriteRoutesActions.addFavouriteRoute, @props.message.route

  render: ->
    <div className="trip-card popup">
      <RouteHeader
        route={@props.context.getStore('RouteInformationStore').getRoute(@props.message.route)}
        pattern={@props.context.getStore('RouteInformationStore').getPattern(@props.message.trip.pattern.id)}
        trip={@props.message.tripStartTime}
        favourite={@props.context.getStore('FavouriteRoutesStore').isFavourite(@props.message.route)}
        addFavouriteRoute={@addFavouriteRoute}/>
      <div className="bottom location">
        <Link to="trip" params={{tripId: @props.message.trip.id}}>
          <Icon img={'icon-icon_time'}> Lähdön tiedot</Icon></Link>
        <br/>
        <Link to="route" params={{routeId: @props.message.trip.pattern.id}} className="route">
          <Icon img={'icon-icon_' + @props.message.mode + "-withoutBox"}> Linjan tiedot</Icon>
        </Link>
      </div>
    </div>

module.exports = RouteMarkerPopup
