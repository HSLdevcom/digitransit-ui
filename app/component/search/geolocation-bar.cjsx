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
  <div className="geolocation input-placeholder" onClick={props.onClick}>
    <div className="geolocation-selected">
      <Icon img={'icon-icon_position'}/>
      {getLocationMessage props.geolocation}
      <span className="close-icon right cursor-pointer">
        <Icon img={'icon-icon_close'} />
      </span>
    </div>
  </div>

GeolocationBar.propTypes =
  geolocation: React.PropTypes.object.isRequired
  onClick: React.PropTypes.func.isRequired

GeolocationBar.displayName = "GeolocationBar"

module.exports = GeolocationBar
