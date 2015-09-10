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
      'column': true

    if @props.state
      classes[@props.checkedClass] = @props.state

    <div className={cx classes, @props.className} onClick={@props.onBtnClick}>
      <div className="icon-holder cursor-pointer">
        <Icon img={'icon-icon_' + @props.icon} className="" />
      </div>
    </div>

module.exports = ToggleButton
