React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
StopCardContainer     = require '../../stop-cards/stop-card-container'
Icon                  = require '../../icon/icon'
Link                  = require 'react-router/lib/Link'
FavouriteStopsAction  = require '../../../action/favourite-stops-action'
MarkerPopupBottom     = require '../marker-popup-bottom'
{FormattedMessage}    = require 'react-intl'

class StopMarkerPopup extends React.Component
  componentDidMount: ->
    @props.context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @props.context.getStore('FavouriteStopsStore').addChangeListener @onChange

  onChange: (id) =>
    if id? and id == @props.stop.id
      @forceUpdate()

  render: ->
    favourite = @props.context.getStore('FavouriteStopsStore').isFavourite(@props.stop.id)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @props.context.executeAction FavouriteStopsAction.addFavouriteStop, @props.stop.id

    <div className="card">
      <StopCardContainer
        stop={@props.stop}
        departures={5}
        date={@props.relay.variables.date}
        className="padding-small cursor-pointer"/>
      <MarkerPopupBottom location={{
        address: @props.stop.name
        lat: @props.stop.lat
        lon: @props.stop.lon
      }}/>
    </div>


module.exports = Relay.createContainer StopMarkerPopup,
  fragments: queries.StopMarkerPopupFragments
  initialVariables:
    date: null
