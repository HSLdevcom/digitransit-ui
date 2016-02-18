React = require 'react'
cx = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'

IconWithTail = (props) ->
  <span>
    <svg viewBox="0 0 40 40" className={cx "icon", "tail", props.className}>
      <use xlinkHref="#icon-icon_vehicle-live-shadow" transform="rotate(180 20 20)"/>
    </svg>
    <svg id={props.id} viewBox="0 0 40 40" className={cx "icon", props.className}>
      <use xlinkHref="##{props.img}"/>
    </svg>
  </span>

IconWithTail.displayName = "IconWithTail"

IconWithTail.description =
  <div>
    <p>Shows an icon from the SVG sprite and adds 'tail' to north.</p>
    <p>Note! At the moment you will have to move tail using css.</p>
    <ComponentUsageExample description="">
      <IconWithTail
        className='bus'
        img={'icon-icon_bus-live'}
      />
    </ComponentUsageExample>
  </div>

IconWithTail.propTypes =
  id: React.PropTypes.string
  className: React.PropTypes.string
  img: React.PropTypes.string.isRequired

module.exports = IconWithTail
