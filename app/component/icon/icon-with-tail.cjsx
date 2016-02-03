React = require 'react'
cx = require 'classnames'

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

IconWithTail.description = "Shows an icon from the SVG sprite and adds 'tail' to north"

module.exports = IconWithTail
