React                 = require 'react'
AddFavouriteContainer = require '../component/favourites/add-favourite-container'
SearchModal           = require '../component/search/search-modal'


class AddFavouritePage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  render: ->
    destination = @context.getStore('EndpointStore').getDestination()

    <div>
      <AddFavouriteContainer />
      <SearchModal ref="modal" initialPosition={destination}/>
    </div>


module.exports = AddFavouritePage
