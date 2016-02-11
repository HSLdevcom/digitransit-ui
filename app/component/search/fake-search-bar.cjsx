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

FakeSearchBar = (props) ->
  <div className="input-placeholder" onClick={props.onClick}>
    <div className="address-box">
      {props.value}
      <span className="inline-block right cursor-pointer" onClick={props.onRemove}>
        <Icon id={props.id} img={'icon-icon_close'} />
      </span>
    </div>
  </div>

FakeSearchBar.propTypes =
  onClick: React.PropTypes.func.isRequired
  onRemove: React.PropTypes.func.isRequired
  value: React.PropTypes.string.isRequired
  id: React.PropTypes.string.isRequired

FakeSearchBar.displayName = "FakeSearchBar"

module.exports = FakeSearchBar
