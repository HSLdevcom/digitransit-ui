React = require 'react'
cx = require 'classnames'

class Offcanvas extends React.Component
  @defaultProps:
    position: 'left'

  render: ->
    classes =
      'off-canvas': true
      'is-active': this.props.open

    classes[this.props.position] = true
    if (this.props.className)
      classes[this.props.className] = true
    <div id={this.props.id} className={cx(classes)}>
        {this.props.children}
    </div>

module.exports = Offcanvas;
