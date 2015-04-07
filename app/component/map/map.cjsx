React              = require 'react'
SearchWithLocation = require '../search-with-location/search-with-location.cjsx'

class Map extends React.Component
  render: ->
    <div className="map">
      <SearchWithLocation/>
      <div className="fullscreen-toggle"></div>
    </div>

module.exports = Map