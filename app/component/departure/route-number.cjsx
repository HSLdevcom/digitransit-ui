React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'

RouteNumber = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "route-number", props.className, {'vertical': props.vertical}} >
    <Icon className={mode} img={'icon-icon_' + mode}/>
    {if props.vertical then <br/>}
    <span className={"vehicle-number " + mode}>{props.text}</span>
  </span>

RouteNumber.description = "Display mode icon and route number with mode color"

RouteNumber.propTypes =
  mode: React.PropTypes.string.isRequired
  text: React.PropTypes.string
  vertical: React.PropTypes.bool

RouteNumber.displayName = "RouteNumber"

module.exports = RouteNumber
