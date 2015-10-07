React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'

class RouteNumber extends React.Component
  PropTypes:
    mode: React.PropTypes.string.isRequired
    lineNumber: React.PropTypes.string.isRequired

  render: ->
    mode = @props.mode.toLowerCase()
    <span className={cx "route-number", @props.className} >
      <Icon className={mode} img={'icon-icon_' + mode}/>
      <span className={"vehicle-number " + mode}>{@props.lineNumber}</span>
    </span>

module.exports = RouteNumber
