React = require 'react'
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
  <div id={props.id} onClick={props.onClick}>
    <div className={cx "input-placeholder", props.className}>
      {inputOrPlaceholder(props.endpoint?.address, props.autosuggestPlaceholder)}
    </div>
  </div>

FakeSearchBar.propTypes =
  className: React.PropTypes.string
  value: React.PropTypes.string
  placeholder: React.PropTypes.string.isRequired

FakeSearchBar.displayName = "FakeSearchBar"

module.exports = FakeSearchBar
