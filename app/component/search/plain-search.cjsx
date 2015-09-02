React          = require 'react'
Autosuggest    = require './autosuggest.cjsx'
Icon           = require '../icon/icon.cjsx'
XhrPromise     = require '../../util/xhr-promise.coffee'
config         = require '../../config'

AUTOSUGGEST_ID = 'autosuggest'

class PlainSearch extends React.Component
  propTypes =
    selection: React.PropTypes.object.isRequired
    onSelection: React.PropTypes.func.isRequired
    clearSelection: React.PropTypes.func.isRequired

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  constructor: ->
    super

  componentDidMount: =>
    @context.getStore('LocationStore').addChangeListener @onGeolocationChange
    @onGeolocationChange()

  componentWillUnmount: =>
    @context.getStore('LocationStore').removeChangeListener @onGeolocationChange

  onGeolocationChange: =>
    geo = @context.getStore('LocationStore').getLocationState()
    @setState geo
    if @props.selection.useCurrentPosition
      if geo.hasLocation
        @props.onSelection {
            lat: geo.lat
            lon: geo.lon
            address: geo.address
        }
      else if not (geo.status == 'no-location' or geo.isLocationingInProgress)
        @removePosition()

  suggestionSelected: (lat, lon, address) =>
    @props.onSelection {
        lat: lat
        lon: lon
        address: address
    }

  # Happens when user presses enter without selecting anything from autosuggest
  onSubmit: (e) =>
    e.preventDefault()

  removePosition: () =>
    @props.clearSelection()

  removeSelection: () =>
    @props.clearSelection()

  render: =>
    # We don't have state on the server, because we don't have a geolocation,
    # so just render the input field
    if @state and @props.selection.useCurrentPosition
      if @state.isLocationingInProgress
        geolocation_text = 'Sijaintiasi etsitään'
      else if @state.hasLocation
        geolocation_text = 'Oma sijainti'
      else
        geolocation_text = 'No location?!?'

      <div className="input-placeholder">
        <div className="address-box">
        <span className="inline-block" onTouchTap={this.locateUser}>
            <Icon img={'icon-icon_mapMarker-location'}/>
        </span>
        {geolocation_text}
        <span className="inline-block right cursor-pointer" onTouchTap={@removePosition}><Icon img={'icon-icon_close'}/></span>
        </div>
      </div>
    else if @props.selection.address
      <div className="input-placeholder">
        <div className="address-box">
          {@props.selection.address}
          <span className="inline-block right cursor-pointer" onTouchTap={@removeSelection}><Icon img={'icon-icon_close'}/></span>
        </div>
      </div>
    else
      <form onSubmit={@onSubmit}>
        <Autosuggest onSelection={@suggestionSelected}
                     placeholder=@props.placeholder
                     />
      </form>

module.exports = PlainSearch
