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
    <div className={cx 'slider-container', @props.className}>
      <h3>{@props.headerText}</h3>
      <input defaultValue={@props.defaultValue} id={@props.id} className={cx('slider')} type="range" min={@props.min} max={@props.max} step={@props.step} onMouseUp={@props.onSliderChange} onTouchEnd={@props.onSliderChange} />
      <span className="slider-help-text left">{@props.minText}</span>
      <span className="slider-help-text right">{@props.maxText}</span>
    </div>



module.exports = Slider
