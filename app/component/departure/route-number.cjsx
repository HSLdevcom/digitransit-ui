React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'

RouteNumber = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "route-number", props.className} >
    <Icon className={mode} img={'icon-icon_' + mode}/>
    <span className={"vehicle-number " + mode}>{props.text}</span>
  </span>

RouteNumber.description = "Display mode icon and route number with mode color"

RouteNumber.propTypes =
  mode: React.PropTypes.string.isRequired
  text: React.PropTypes.string.isRequired

RouteNumber.displayName = "RouteNumber"

module.exports = RouteNumber
