React       = require 'react'
Icon        = require '../icon/icon.cjsx'
cx          = require 'classnames'

RouteDestination = (props) ->
  mode = props.mode.toLowerCase()
  <span className={cx "route-destination", props.className} >
    <Icon className={mode} img='icon-icon_arrow-right'/>
    <span className="destination">&nbsp;{props.destination}</span>
  </span>

RouteDestination.description =
  "Display arrow with mode color and the destination of the route (headsign)"

RouteDestination.propTypes =
  mode: React.PropTypes.string.isRequired
  destination: React.PropTypes.string.isRequired

RouteDestination.displayName = "RouteDestination"

module.exports = RouteDestination
