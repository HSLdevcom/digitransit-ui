React = require 'react'
Icon = require '../icon/icon'
{FormattedMessage} = require 'react-intl'
cx = require 'classnames'

inputOrPlaceholder = (value, placeholder) ->
  if value != undefined and value != null and value != ""
    <div className="address-input no-select">
      {value}
    </div>
  else
    <div className="address-placeholder no-select">
      {placeholder}
    </div>

FakeSearchBar = (props) ->
  <div className="input-placeholder" onClick={props.onClick}>
    {inputOrPlaceholder(props.value, props.placeholder)}
  </div>

FakeSearchBar.propTypes =
  onClick: React.PropTypes.func.isRequired
  value: React.PropTypes.string
  placeholder: React.PropTypes.string.isRequired

FakeSearchBar.displayName = "FakeSearchBar"

module.exports = FakeSearchBar
