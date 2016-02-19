React                 = require 'react'
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

  render: ->

    favourites = @context.getStore('FavouriteLocationStore').getLocations()

    columns = [0 ... 3].map (value, index) =>
      if typeof favourites[index] == 'undefined'
        <FavouriteLocation
          empty={true}/>
      else
        <FavouriteLocation
          locationName={favourites[index].locationName}
          favouriteLocationIconId={favourites[index].selectedIconId}
          empty={false}
          lat={favourites[index].lat}
          lon={favourites[index].lon}
          clickFavourite={@setDestination}
        />

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
