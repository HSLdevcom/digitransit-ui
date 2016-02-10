React                 = require 'react'
FavouriteLocation     = require './favourite-location'
Icon                  = require '../icon/icon'
ComponentUsageExample = require '../documentation/component-usage-example'



class FavouriteLocationsContainer extends React.Component

  @description:
    <div>
      <p>Renders a container with favourite locations</p>
      <ComponentUsageExample description="">
        <FavouriteLocationsContainer/>
      </ComponentUsageExample>
    </div>

  getFavouriteLocationIconId: ->
    'icon-icon_place'

  render: ->
    <div className="row">
      <div className="small-4 columns favourite-location-container--first">
        <FavouriteLocation
          locationName={"Koti"}
          favouriteLocationIconId={@getFavouriteLocationIconId()}
          arrivalTime={"14:33"}
          departureTime={"2 min"}
          empty={false}
          realtime={false}/>
      </div>
      <div className="small-4 columns favourite-location-container">
        <FavouriteLocation
          locationName={"Työ"}
          favouriteLocationIconId={@getFavouriteLocationIconId()}
          arrivalTime={"14:38"}
          departureTime={"3 min"}
          empty={false}
          realtime={true}/>
      </div>
      <div className="small-4 columns favourite-location-container--last">
        <FavouriteLocation
          locationName={"Mummola"}
          favouriteLocationIconId={@getFavouriteLocationIconId()}
          arrivalTime={"15:38"}
          departureTime={"15 min"}
          empty={false}
          realtime={true}/>
      </div>
    </div>


module.exports = FavouriteLocationsContainer
