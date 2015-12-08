React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
RouteHeader           = require '../../route/route-header'
Icon                  = require '../../icon/icon.cjsx'
Link                  = require 'react-router/lib/Link'
FavouriteRoutesActions = require '../../../action/favourite-routes-action'


class RouteMarkerPopup extends React.Component
  @childContextTypes:
    history: React.PropTypes.object.isRequired

  getChildContext: () ->
    history: @props.context.history

  componentDidMount: ->
    @props.context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @props.context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.trip.route.gtfsId
      @forceUpdate()

  addFavouriteRoute: (e) =>
    e.stopPropagation()
    @props.context.executeAction FavouriteRoutesActions.addFavouriteRoute, @props.trip.route.gtfsId

  render: ->
    <div className="card">
      <RouteHeader
        route={@props.trip.route}
        pattern={@props.trip.fuzzyTrip.pattern}
        trip={@props.message.tripStartTime}
        favourite={@props.context.getStore('FavouriteRoutesStore').isFavourite(@props.trip.route.gtfsId)}
        addFavouriteRoute={@addFavouriteRoute}/>
      <div className="bottom location">
        <Link to="/lahdot/#{@props.trip.fuzzyTrip.gtfsId}">
          <Icon img={'icon-icon_time'}/> Lähdön tiedot</Link>
        <br/>
        <Link to="/linjat/#{@props.trip.fuzzyTrip.pattern.code}" className="route">
          <Icon img={'icon-icon_' + @props.message.mode + "-withoutBox"}/> Linjan tiedot
        </Link>
      </div>
    </div>

module.exports = Relay.createContainer(RouteMarkerPopup,
  fragments: queries.RouteMarkerPopupFragments
  initialVariables:
    route: null
    direction: null
    date: null
    time: null
)
