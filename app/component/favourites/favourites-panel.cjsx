React                           = require 'react'
FavouriteLocationsContainer     = require './favourite-locations-container'

class FavouritesPanel extends React.Component

  constructor: ->
    super

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onTimeChange

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onChange: (id) =>
    @forceUpdate()

  onTimeChange: (e) =>
    if e.currentTime
      @forceUpdate()

  render: ->

    <div>
      <FavouriteLocationsContainer/>
    </div>

module.exports = FavouritesPanel
