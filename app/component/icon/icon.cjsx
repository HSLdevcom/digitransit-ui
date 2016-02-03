React = require 'react'
cx = require 'classnames'

Icon = (props) ->
  <span>
    <svg id={props.id} viewBox="0 0 40 40" className={cx "icon", props.className}>
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
