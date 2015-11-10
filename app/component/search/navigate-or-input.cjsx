React = require 'react'
Icon = require '../icon/icon'
{FormattedMessage} = require 'react-intl'


getTrackMeMessage = () ->
  <FormattedMessage
    id="locate"
    defaultMessage='Locate'
  />

getOriginMessage = () ->
  <FormattedMessage
    id="give-origin"
    defaultMessage='Type origin'
  />

NavigateOrInput = (props) ->
  <div className="input-placeholder navigate-or-input">
      <span onClick={props.setToCurrent}  className="inline-block">
        <Icon img='icon-icon_mapMarker-location' className={"navigate-or-input-icon--offline"}/>
      </span>
      <span onClick={props.setToCurrent} className="navigate-or-input-messages">{getTrackMeMessage()}</span>
      <span className="navigate-or-input--or"><FormattedMessage id="or" defaultMessage='or' /></span>
      <span onClick={props.enableInput.bind(null, props.id)} className="navigate-or-input-messages">{getOriginMessage()}</span>
  </div>

NavigateOrInput.propTypes =
  setToCurrent: React.PropTypes.func.isRequired
  enableInput: React.PropTypes.func.isRequired
  id: React.PropTypes.string.isRequired

NavigateOrInput.displayName = "NavigateOrInput"

module.exports = NavigateOrInput
