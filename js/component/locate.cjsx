React = require('react');
ReactPropTypes = React.PropTypes;
LocateActions = require('../action/locate-actions.coffee')
LocationStore = require('../store/location-store.coffee');

getLocationState = ->
  lat: LocationStore.lat
  lon: LocationStore.lon
  address: LocationStore.address


Locate = React.createClass
  getInitialState: -> 
    getLocationState() 
  
  componentDidMount: -> 
    LocationStore.addChangeListener(this.onChange)

  componentWillUnmount: ->
    LocationStore.removeChangeListener(this.onChange)

  onChange: ->
    this.setState(getLocationState())

  render: ->
    location = this.state.lat + ": " + this.state.lon + ", " + this.state.address
    <div>
      <div className="small-1 columns">
        <span className="prefix transparent" onClick={this.locateUser}>
          <i className="icon icon-location"></i>
        </span>
      </div>
      <div className="small-10 columns">
        <input type="text" placeholder={location} className="transparent"/>
      </div>
      <div className="small-1 columns">
        <span className="postfix transparent" onClick={this.removeLocation}>
          <i className="icon icon-clear"></i>
        </span>
      </div>
    </div>

  locateUser: ->
    LocateActions.findLocation()

  removeLocation: ->
    LocateActions.removeLocation()

module.exports = Locate