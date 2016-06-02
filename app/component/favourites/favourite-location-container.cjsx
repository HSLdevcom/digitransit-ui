React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
FavouriteLocation     = require('./FavouriteLocation').default
Icon                  = require '../icon/icon'
config                = require '../../config'

class FavouriteLocationContainer extends React.Component
  render: =>
    plan = @props.plan.plan
    itinerary = plan.itineraries[0] || {}
    firstTransitLeg = itinerary.legs?.filter((leg) => leg.transitLeg)[0]
    <FavouriteLocation
      locationName={@props.favourite.locationName}
      favouriteLocationIconId={@props.favourite.selectedIconId}
      lat={@props.favourite.lat}
      lon={@props.favourite.lon}
      clickFavourite={@props.onClickFavourite}
      departureTime={itinerary.startTime / 1000}
      arrivalTime={itinerary.endTime / 1000}
      currentTime={@props.currentTime}
      firstTransitLeg={firstTransitLeg}
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
    wheelchair: false
    maxWalkDistance: config.maxWalkDistance + 0.1
    preferred:
      agencies: config.preferredAgency or ""
    arriveBy: false
    disableRemainingWeightHeuristic: false
