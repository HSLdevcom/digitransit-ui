React         = require 'react'
cx            = require 'classnames'
Icon          = require '../icon/icon'


class ToggleButton extends React.Component
  @propTypes =
    onBtnClick: React.PropTypes.func


  render: ->
    #if checked
      # @props.checkedClass to btn div
    classes =
      'btn': true

    if @props.state
      classes[@props.checkedClass] = @props.state

    if @props.icon
      iconTag = <div className="icon-holder"><Icon img={'icon-icon_' + @props.icon} className="" /></div>
    <div className={cx 'cursor-pointer', classes, @props.className} onClick={@props.onBtnClick} style={@props.style}>
      {iconTag}
      <div>
        {@props.children}
      </div>
    </div>

module.exports = ToggleButton
