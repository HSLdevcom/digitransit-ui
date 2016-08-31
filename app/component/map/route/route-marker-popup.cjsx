React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
RouteHeader           = require('../../route/RouteHeader').default
Icon                  = require '../../icon/icon'
Link                  = require 'react-router/lib/Link'
{addFavouriteRoute}   = require '../../../action/FavouriteActions'
connectToStores       = require 'fluxible-addons-react/connectToStores'

class RouteMarkerPopup extends React.Component
  @childContextTypes:
    router: React.PropTypes.object.isRequired

  getChildContext: () ->
    router: @props.context.router

  addAsFavouriteRoute: (e) =>
    e.stopPropagation()
    @props.context.executeAction addFavouriteRoute, @props.trip.route.gtfsId

  render: ->
    <div className="card">
      <RouteHeader
        route={@props.trip.route}
        pattern={@props.trip.fuzzyTrip.pattern}
        trip={@props.message.tripStartTime}
        favourite={@props.favourite}
        addFavouriteRoute={@addAsFavouriteRoute}/>
      <div className="bottom location">
        <Link to="/linjat/#{@props.trip.route.gtfsId}/pysakit/#{@props.trip.fuzzyTrip.pattern.code}/#{@props.trip.fuzzyTrip.gtfsId}">
          <Icon img={'icon-icon_time'}/> Lähdön tiedot
        </Link>
        <br/>
        <Link to="/linjat/#{@props.trip.route.gtfsId}/pysakit/#{@props.trip.fuzzyTrip.pattern.code}" className="route">
          <Icon img={'icon-icon_' + @props.message.mode + "-withoutBox"}/> Linjan tiedot
        </Link>
      </div>
    </div>

RouteMarkerPopupWithFavourite = connectToStores RouteMarkerPopup, ['FavouriteRoutesStore'], (context, props) ->
  favourite: context.getStore('FavouriteRoutesStore').isFavourite(props.trip.route.gtfsId)

module.exports = Relay.createContainer(RouteMarkerPopupWithFavourite,
  fragments: queries.RouteMarkerPopupFragments
  initialVariables:
    route: null
    direction: null
    date: null
    time: null
)
