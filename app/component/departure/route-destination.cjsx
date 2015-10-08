React       = require 'react'
Icon        = require '../icon/icon.cjsx'
cx          = require 'classnames'

class RouteDestination extends React.Component
  @destination:
   "Display arrow with mode color and the destination of the route (headsign)"

  @propTypes:
    mode: React.PropTypes.string.isRequired
    destination: React.PropTypes.string.isRequired

  render: ->
    mode = @props.mode.toLowerCase()
    <span className={cx "route-destination", @props.className} >
      <Icon className={mode} img='icon-icon_arrow-right'/>
      <span className="destination">&nbsp;{@props.destination}</span>
    </span>

module.exports = RouteDestination
