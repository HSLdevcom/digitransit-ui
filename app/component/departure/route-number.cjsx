React = require 'react'
cx    = require 'classnames'
Icon  = require '../icon/icon'

class RouteNumber extends React.Component
  @description:
    "Display mode icon and route number with mode color"

  @propTypes:
    mode: React.PropTypes.string.isRequired
    text: React.PropTypes.string.isRequired

  render: ->
    mode = @props.mode.toLowerCase()
    <span className={cx "route-number", @props.className} >
      <Icon className={mode} img={'icon-icon_' + mode}/>
      <span className={"vehicle-number " + mode}>{@props.text}</span>
    </span>

module.exports = RouteNumber
