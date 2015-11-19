React = require 'react'
cx = require 'classnames'

class Offcanvas extends React.Component
  @defaultProps:
    position: 'left'

  render: ->
    classes =
      'off-canvas': true
      'is-active': @props.open

    classes[@props.position] = true
    if (@props.className)
      classes[@props.className] = true
    <div id={@props.id} className={cx classes}>
        {@props.children}
    </div>

module.exports = Offcanvas
