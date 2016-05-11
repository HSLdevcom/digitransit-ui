React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
FavouriteLocationContainer = require './favourite-location-container'
FavouriteLocation     = require './favourite-location'
Icon                  = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'
EndpointActions       = require '../../action/endpoint-actions'
connectToStores       = require 'fluxible-addons-react/connectToStores'


class FavouriteLocationsContainer extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  @description:
    <div>
      <p>Renders a container with favourite locations</p>
      <ComponentUsageExample description="">
        <FavouriteLocationsContainer/>
      </ComponentUsageExample>
    </div>

  setDestination: (locationName, lat, lon) =>
    location =
      lat: lat
      lon: lon
      address: locationName

    @context.executeAction EndpointActions.setEndpoint, {target: "destination", endpoint: location}

  getFavourite: (index) =>
    favourite = @props.favourites[index]
    if typeof favourite == 'undefined'
      <FavouriteLocation />
    else
      favouriteLocation = <FavouriteLocation
        locationName={favourite.locationName}
        favouriteLocationIconId={favourite.selectedIconId}
        lat={favourite.lat}
        lon={favourite.lon}
        clickFavourite={@setDestination}
      />
      if @props.location
        <Relay.RootContainer
          Component={FavouriteLocationContainer}
          forceFetch={true}
          route={new queries.FavouriteLocationContainerRoute(
            from:
              lat: @props.location.lat
              lon: @props.location.lon
            to:
              lat: favourite.lat
              lon: favourite.lon
          )}
          renderLoading={=> favouriteLocation}
          renderFetched={(data) =>
            <FavouriteLocationContainer
              favourite={favourite}
              onClickFavourite={@setDestination}
              currentTime={@props.currentTime.unix()}
              {...data}
            />
          }
        />
      else favouriteLocation

  render: ->
    <div>
      <div className="small-4 columns favourite-location-container--first">
        {@getFavourite 0}
      </div>
      <div className="small-4 columns favourite-location-container">
        {@getFavourite 1}
      </div>
      <div className="small-4 columns favourite-location-container--last">
        {@getFavourite 2}
      </div>
    </div>


module.exports = connectToStores FavouriteLocationsContainer, ['TimeStore', 'FavouriteLocationStore', 'EndpointStore'], (context, props) ->
  position = context.getStore('PositionStore').getLocationState()
  origin = context.getStore('EndpointStore').getOrigin()

  currentTime: context.getStore('TimeStore').getCurrentTime()
  favourites: context.getStore('FavouriteLocationStore').getLocations()
  location:
    if origin.useCurrentPosition
      if position.hasLocation
        position
      else
        false
    else
      origin
