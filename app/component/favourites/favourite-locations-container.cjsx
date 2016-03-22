React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
FavouriteLocationContainer = require './favourite-location-container'
FavouriteLocation     = require './favourite-location'
Icon                  = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'
EndpointActions       = require '../../action/endpoint-actions'


class FavouriteLocationsContainer extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
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

  componentDidMount: ->
    @context.getStore('TimeStore').addChangeListener @onTimeChange

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onTimeChange: (e) =>
    if e.currentTime
      @forceUpdate()

  now: =>
    @context.getStore('TimeStore').getCurrentTime()

  render: ->
    favourites = @context.getStore('FavouriteLocationStore').getLocations()
    PositionStore = @context.getStore 'PositionStore'
    location = PositionStore.getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()

    if origin?.lat
      position = origin
    else if (location.status == PositionStore.STATUS_FOUND_LOCATION or
             location.status == PositionStore.STATUS_FOUND_ADDRESS)
      position = location
    else if location.status == PositionStore.STATUS_SEARCHING_LOCATION
      # spinner
    else
      # no position

    columns = [0 ... 3].map (value, index) =>
      favourite = favourites[index]
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
        if position
          <Relay.RootContainer
            Component={FavouriteLocationContainer}
            forceFetch={true}
            route={new queries.FavouriteLocationContainerRoute(
              from:
                lat: position.lat
                lon: position.lon
              to:
                lat: favourite.lat
                lon: favourite.lon
            )}
            renderLoading={=> favouriteLocation}
            renderFetched={(data) =>
              <FavouriteLocationContainer
                favourite={favourite}
                onClickFavourite={@setDestination}
                currentTime={@now().unix()}
                {...data}
              />
            }
          />
        else favouriteLocation

    <div>
      <div className="small-4 columns favourite-location-container--first">
        {columns[0]}
      </div>
      <div className="small-4 columns favourite-location-container">
        {columns[1]}
      </div>
      <div className="small-4 columns favourite-location-container--last">
        {columns[2]}
      </div>
    </div>


module.exports = FavouriteLocationsContainer
