React = require 'react'
cx = require 'classnames'

Icon = (props) ->
  viewBox = if props.viewBox then props.viewBox else "0 0 40 40"
  <span>
    <svg id={props.id} viewBox={viewBox} className={cx "icon", props.className}>
      <use xlinkHref="##{props.img}"/>
    </svg>
  </span>

Icon.asString = (img, className, id) -> """<span>
  <svg#{if id then " id=" + id else ""} viewBox="0 0 40 40" class="#{cx "icon", className}">
    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="##{img}"/>
  </svg></span>
"""

Icon.displayName = "Icon"

Icon.description = "Shows an icon from the SVG sprite"

module.exports = Icon
