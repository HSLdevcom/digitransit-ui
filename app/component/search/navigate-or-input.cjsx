React = require 'react'
Icon = require '../icon/icon'
{FormattedMessage} = require 'react-intl'

NavigateOrInput = (props) ->
  <div className="input-placeholder navigate-or-input">
    <span onClick={props.setToCurrent}  className="inline-block">
      <Icon
        img='icon-icon_mapMarker-location'
        className={"navigate-or-input-icon--offline"}
      />
    </span>
    <span
      onClick={props.setToCurrent}
      className="navigate-or-input-messages">
        <FormattedMessage
          id={props.locateId}
          defaultMessage={props.locateDefault}
        />
    </span>
    <span className="navigate-or-input--or">
      <FormattedMessage id="or" defaultMessage='or' />
    </span>
    <span
      onClick={props.enableInput}
      className="navigate-or-input-messages">
        <FormattedMessage
          id={props.giveId}
          defaultMessage={props.giveDefault}
        />
    </span>
  </div>

NavigateOrInput.propTypes =
  setToCurrent: React.PropTypes.func.isRequired
  enableInput: React.PropTypes.func.isRequired
  id: React.PropTypes.string.isRequired

NavigateOrInput.displayName = "NavigateOrInput"

module.exports = NavigateOrInput
