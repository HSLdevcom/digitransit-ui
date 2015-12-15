React = require 'react'
Icon = require '../icon/icon'
{FormattedMessage} = require 'react-intl'
cx = require 'classnames'

getLocationMessage = (geolocation) ->

  if geolocation.hasLocation
    <FormattedMessage id="own-position" defaultMessage='Your current location' />
  else if geolocation.isLocationingInProgress
    <FormattedMessage id="searching-position" defaultMessage='Searching for your position...' />
  else
    <FormattedMessage id="no-position" defaultMessage='No position' />

GeolocationBar = (props) ->
  <div className="input-placeholder">
    <div className="address-box">
      <span className={cx 'inline-block', 'geolocation-bar-location-icon'} onClick={props.locateUser}>
        <Icon img={'icon-icon_position'}/>
      </span>
      {getLocationMessage props.geolocation}
      <span className="inline-block right cursor-pointer" onClick={props.removePosition}>
        <Icon id={props.id} img={'icon-icon_close'} />
      </span>
    </div>
  </div>

GeolocationBar.propTypes =
  locateUser: React.PropTypes.func.isRequired
  removePosition: React.PropTypes.func.isRequired
  geolocation: React.PropTypes.object.isRequired
  id: React.PropTypes.string.isRequired

GeolocationBar.displayName = "GeolocationBar"

module.exports = GeolocationBar
