React          = require 'react'
LocateActions  = require '../../action/locate-actions.coffee'
LocationStore  = require '../../store/location-store.coffee'
ReactPropTypes = React.PropTypes;

class SearchWithLocation extends React.Component
  constructor: -> 
    super
    @state = LocationStore.getLocationState() 
  
  componentDidMount: -> 
    LocationStore.addChangeListener @onChange

  componentWillUnmount: ->
    LocationStore.removeChangeListener @onChange

  onChange: =>
    @setState LocationStore.getLocationState()

  render: ->
    location = this.state.lat + ": " + this.state.lon + ", " + this.state.address
    <form className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse prefix-and-postfix-radius">
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
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <input type="text" placeholder="Määränpään osoite, linja, pysäkki tai aika" />
            </div>
            <div className="small-1 columns">
              <span className="postfix search"><i className="icon icon-search"></i></span>
            </div>
          </div>
        </div>
      </div>
    </form>

  locateUser: ->
    LocateActions.findLocation()

  removeLocation: ->
    LocateActions.removeLocation()

module.exports = SearchWithLocation