React         = require 'react'
cx            = require 'classnames'

# Note: The <input type="range"> element is not supported in
# Internet Explorer 9 and earlier versions.
class Slider extends React.Component
  @propTypes:
    onSliderChange: React.PropTypes.func.isRequired

  @defaultProps:
    min: 0
    max: 100
    step: 1
    headerText: ""
    minText: ""
    maxText: ""

  render: ->
    classes =
      'slider': true

    if (@props.className)
      classes[@props.className] = true
    <div className={cx classes}>
      <h3>{@props.headerText}</h3>
      <input id={@props.id} className={cx(classes)} type="range" min={@props.min} max={@props.max} step={@props.step} onChange={@props.onSliderChange} />
      <p>
        <span>{@props.minText}</span>
        <span>{@props.maxText}</span>
      </p>
    </div>



module.exports = Slider
