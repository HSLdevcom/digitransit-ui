React       = require 'react'
Icon        = require '../icon/icon.cjsx'
cx          = require 'classnames'

class RouteDestination extends React.Component
  PropTypes:
    mode: React.PropTypes.string.isRequired
    destination: React.PropTypes.string.isRequired

  render: ->
    mode = @props.mode.toLowerCase()
    <span className={cx "route-destination", @props.className} >
      <Icon className={mode} img='icon-icon_arrow-right'/>
      <span className="destination">&nbsp;{@props.destination}</span>
    </span>

module.exports = RouteDestination
