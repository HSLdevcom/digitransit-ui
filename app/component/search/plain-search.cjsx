React          = require 'react'
Autosuggest    = require './autosuggest.cjsx'
Icon           = require '../icon/icon.cjsx'
XhrPromise     = require '../../util/xhr-promise.coffee'
config         = require '../../config'

AUTOSUGGEST_ID = 'autosuggest'

class PlainSearch extends React.Component
  propTypes =
    initialSelection: React.PropTypes.object
    onSelection: React.PropTypes.func.isRequired
    filterCities: React.PropTypes.arrayOf(React.PropTypes.String)

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func.isRequired

  constructor: ->
    super

  componentWillMount: =>
    @setState
        selection: null

  suggestionSelected: (lat, lon, address) =>
    suggestion =
        lat: lat,
        lon: lon,
        address: address
    @setState
        selection: suggestion
    @props.onSelection(suggestion)


  # Happens when user presses enter without selecting anything from autosuggest
  onSubmit: (e) =>
    e.preventDefault()

  removePosition: () =>
    if @props.removePosition
      @props.removePosition()

  removeSelection: () =>
    @setState
        selection: null

  render: =>
    if @props.useCurrentPosition
      <div className="input-placeholder">
        <div className="address-box">
        <span className="inline-block" onTouchTap={this.locateUser}>
            <Icon img={'icon-icon_mapMarker-location'}/>
        </span>
        Oma sijainti
        <span className="inline-block right cursor-pointer" onTouchTap={@removePosition}><Icon img={'icon-icon_close'}/></span>
        </div>
      </div>
    else if @state.selection
      <div className="input-placeholder">
        <div className="address-box">
          {@state.selection.address}
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
