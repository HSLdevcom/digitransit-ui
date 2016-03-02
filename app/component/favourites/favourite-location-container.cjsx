React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
FavouriteLocation     = require './favourite-location'
Icon                  = require '../icon/icon'

class FavouriteLocationContainer extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: =>
    plan = @props.plan.plan
    itinerary = plan.itineraries[0]
    <FavouriteLocation
      locationName={@props.favourite.locationName}
      favouriteLocationIconId={@props.favourite.selectedIconId}
      empty={false}
      lat={@props.favourite.lat}
      lon={@props.favourite.lon}
      clickFavourite={@props.onClickFavourite}
      departureTime={itinerary.startTime / 1000}
      arrivalTime={itinerary.endTime / 1000}
      realtime={false}
      currentTime={@props.currentTime}
    />

module.exports = Relay.createContainer FavouriteLocationContainer,
  fragments: queries.FavouriteLocationContainerFragments
  initialVariables:
    fromLat: null
    fromLon: null
    toLat: null
    toLon: null
    numItineraries: 1
