React = require 'react'
Icon = require '../icon/icon'
{FormattedMessage} = require 'react-intl'

getLocationMessage = (geolocation) ->

  if geolocation.hasLocation
    <FormattedMessage id="own-position" defaultMessage='My current position' />
  else if geolocation.isLocationingInProgress
    <FormattedMessage id="searching-position" defaultMessage='Searching for your position...' />
  else
    <FormattedMessage id="no-position" defaultMessage='No position' />

GeolocationBar = (props) ->
  <div className="input-placeholder">
    <div className="address-box">
      <span className="inline-block" onClick={props.locateUser}>
        <Icon img={'icon-icon_mapMarker-location'}/>
      </span>
      {getLocationMessage props.geolocation}
      <span className="inline-block right cursor-pointer" onClick={props.removePosition}>
        <Icon img={'icon-icon_close'} />
      </span>
    </div>
  </div>

GeolocationBar.propTypes =
  locateUser: React.PropTypes.func.isRequired
  removePosition: React.PropTypes.func.isRequired
  geolocation: React.PropTypes.object.isRequired

GeolocationBar.displayName = "GeolocationBar"

module.exports = GeolocationBar
