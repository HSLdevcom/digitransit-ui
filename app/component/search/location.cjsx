React          = require 'react'
LocateActions  = require '../../action/locate-actions.coffee'
Icon           = require '../icon/icon.cjsx'

class Location extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  constructor: -> 
    super
    @state = @context.getStore('LocationStore').getLocationState() 
  
  componentDidMount: -> 
     @context.getStore('LocationStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onChange

  onChange: =>
    @setState @context.getStore('LocationStore').getLocationState()

  locateUser: ->
    @context.executeAction LocateActions.findLocation

  removeLocation: (e) ->
    @context.executeAction LocateActions.removeLocation

  render: ->
    arrow = null
    searchPlaceholder = null
    clearLocation = null
    LocationStore = @context.getStore 'LocationStore'

    switch this.state.status
      when LocationStore.STATUS_NO_LOCATION
        location = <span className="inline-block cursor-pointer" onTouchTap={this.locateUser}><span className="dashed">Paikanna</span> tai kirjoita lähtöpaikkasi</span>
        arrow = <div className="arrow-down"></div>
        searchPlaceholder = "Lähtöosoite, linja tai pysäkki"
      when LocationStore.STATUS_SEARCHING_LOCATION
        location = <span className="inline-block cursor-pointer">Paikannetaan...</span>
        searchPlaceholder = ""
      when LocationStore.STATUS_FOUND_LOCATION
        location = <span className="inline-block cursor-pointer address" onTouchTap={this.locateUser}>{this.state.address}</span>
        searchPlaceholder = ""
      when LocationStore.STATUS_FOUND_ADDRESS
        location = <span className="inline-block cursor-pointer address" onTouchTap={this.locateUser}>{this.state.address}</span>
        clearLocation = <span className="inline-block right cursor-pointer" onTouchTap={this.removeLocation}><Icon img={'icon-icon_close'}/></span>
        searchPlaceholder = "Määränpään osoite, linja, tai pysäkki"
      when LocationStore.STATUS_GEOLOCATION_DENIED
        location = <span className="inline-block cursor-pointer" onTouchTap={this.locateUser}>Lähtöosoite, linja tai pysäkki</span>
      when LocationStore.STATUS_GEOLOCATION_NOT_SUPPORTED
        location = <span className="inline-block cursor-pointer" onTouchTap={this.locateUser}>Kirjoita lähtöpaikkasi</span>
      when LocationStore.STATUS_GEOLOCATION_TIMEOUT
        location = <span className="inline-block cursor-pointer" onTouchTap={this.locateUser}>Paikannus ei onnistunut. <span className="dashed">Yritä uudelleen</span> tai kirjoita lähtöpiste</span>
    
    <div className="transparent location"> 
      <span className="inline-block" onTouchTap={this.locateUser}>
        <Icon img={'icon-icon_mapMarker-location'}/>
      </span>
      {location}
      {arrow}
      {clearLocation}
    </div>

module.exports = Location