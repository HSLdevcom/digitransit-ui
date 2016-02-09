React                 = require 'react'
FavouriteLocation     = require './favourite-location'
Icon                  = require '../icon/icon'


class FavouriteLocationsContainer extends React.Component

  getFavouriteLocationIcon: ->
    <Icon img={'icon-icon_place'}/>

  render: ->
    <div className="row">
      <div className="small-4 columns favourite-location-container--first">
        <FavouriteLocation
          locationName={"Koti"}
          favouriteLocationIcon={@getFavouriteLocationIcon()}
          arrivalTime={"14:33"}
          departureTime={"2 min"}
          empty={false}
          realtime={false}/>
      </div>
      <div className="small-4 columns favourite-location-container">
        <FavouriteLocation
          locationName={"Työ"}
          favouriteLocationIcon={@getFavouriteLocationIcon()}
          arrivalTime={"14:38"}
          departureTime={"3 min"}
          empty={false}
          realtime={true}/>
      </div>
      <div className="small-4 columns favourite-location-container--last">
        <FavouriteLocation
          locationName={"Mummola"}
          favouriteLocationIcon={@getFavouriteLocationIcon()}
          arrivalTime={"15:38"}
          departureTime={"15 min"}
          empty={false}
          realtime={true}/>
      </div>
    </div>


module.exports = FavouriteLocationsContainer
