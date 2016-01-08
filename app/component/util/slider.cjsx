React         = require 'react'
cx            = require 'classnames'

# Note: The <input type="range"> element is not supported in
# Internet Explorer 9 and earlier versions.
class Slider extends React.Component
  @propTypes:
    onSliderChange: React.PropTypes.func.isRequired
    min: React.PropTypes.number
    max: React.PropTypes.number
    step: React.PropTypes.number
    headerText: React.PropTypes.string
    minText: React.PropTypes.string
    maxText: React.PropTypes.string

  @defaultProps:
    min: 0
    max: 100
    step: 1
    headerText: ""
    minText: ""
    maxText: ""

  componentDidMount: ->
    @refs.slider.addEventListener("touchmove", @f)

  componentWillUnmount: ->
    @refs.slider.removeEventListener("touchmove", @f)

  f: (e) ->
    #prevent right nav from hiding
    e.stopPropagation()

  render: ->
    <div ref="slider" className={cx 'slider-container', @props.className}>
      <h4>{@props.headerText}</h4>
      <input
        id={@props.id}
        className={cx 'slider'}
        type="range"
        defaultValue={@props.defaultValue}
        min={@props.min}
        max={@props.max}
        step={@props.step}
        onMouseUp={@props.onSliderChange}
        onTouchEnd={@props.onSliderChange}
      />
      <span className="sub-header-h5 left">{@props.minText}</span>
      <span className="sub-header-h5 right">{@props.maxText}</span>
    </div>

module.exports = Slider
