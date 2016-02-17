React                 = require 'react'
AddFavouriteContainer = require '../component/favourites/add-favourite-container'

class AddFavouritePage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  render: ->
    <AddFavouriteContainer />


module.exports = AddFavouritePage
