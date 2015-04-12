React              = require 'react'

class Map extends React.Component
  render: ->
    <div className="map">
      {@props.children}
      <div className="fullscreen-toggle"></div>
    </div>

module.exports = Map