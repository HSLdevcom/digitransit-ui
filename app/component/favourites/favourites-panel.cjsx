React                           = require 'react'
FavouriteLocationsContainer     = require './favourite-locations-container'

class FavouritesPanel extends React.Component

  constructor: ->
    super

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: ->

    <div>
      <FavouriteLocationsContainer/>
    </div>

module.exports = FavouritesPanel
