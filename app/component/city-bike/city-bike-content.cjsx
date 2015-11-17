React                 = require 'react'
CityBikeAvailability  = require('./city-bike-availability')
CityBikeUse           = require('./city-bike-use')


CityBikeContent = (props) ->

  render: ->
    <div className="city-bike-container">
      <CityBikeAvailability
        bikesAvailable={props.station.bikesAvailable}
        totalSpaces={props.station.bikesAvailable + props.station.spacesAvailable}/>
      <CityBikeUse/>
    </div>

CityBikeContent.displayName = "CityBikeContent"

module.exports = CityBikeContent
