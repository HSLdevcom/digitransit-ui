React = require 'react'
Icon = require '../icon/icon'
{FormattedMessage} = require 'react-intl'

NavigateOrInput = (props) ->
  <div id={props.id} style={
    visibility: props.visibility
    position: "absolute"
    top: "0px"} className="input-placeholder navigate-or-input">
    <span className="inline-block">
      <Icon
        img='icon-icon_position'
        className={"navigate-or-input-icon--offline"}
      />
    </span>
    <span id={props.id + "-locate"}
      className="navigate-or-input-messages">
        <FormattedMessage
          id='locate'
          defaultMessage='Locate'
        />
    </span>
    <span className="navigate-or-input--or">
      <FormattedMessage id="or" defaultMessage='or' />
    </span>
    <span id={props.id + "-input"}
      className="navigate-or-input-messages">
        {props.text}
    </span>
  </div>

NavigateOrInput.propTypes =
  text: React.PropTypes.string.isRequired
  id: React.PropTypes.string.isRequired
  visibility: React.PropTypes.string.isRequired

NavigateOrInput.displayName = "NavigateOrInput"

module.exports = NavigateOrInput
