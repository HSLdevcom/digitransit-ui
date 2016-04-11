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
    if itinerary.legs
      transitLegs = itinerary.legs.filter((leg) => leg.transitLeg)
      firstTransitLegIsRealtime = transitLegs.length > 0 and transitLegs[0].realTime
    <FavouriteLocation
      locationName={@props.favourite.locationName}
      favouriteLocationIconId={@props.favourite.selectedIconId}
      lat={@props.favourite.lat}
      lon={@props.favourite.lon}
      clickFavourite={@props.onClickFavourite}
      departureTime={itinerary.startTime / 1000}
      arrivalTime={itinerary.endTime / 1000}
      realtime={firstTransitLegIsRealtime}
      currentTime={@props.currentTime}
    />

module.exports = Relay.createContainer FavouriteLocationContainer,
  fragments: queries.FavouriteLocationContainerFragments
  initialVariables:
    from: null
    to: null
    numItineraries: 1
    walkReluctance: 2.0001
    walkBoardCost: 600
    minTransferTime: 180
    walkSpeed: 1.2
