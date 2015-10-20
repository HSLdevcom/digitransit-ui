React = require 'react'

if window?
  require './icon.css'

Icon = (props) ->
  <span>
    <svg id={props.id} viewBox="0 0 40 40" className={"icon #{props.className}"}>
      <use xlinkHref="##{props.img}"/>
    </svg>
  </span>

Icon.displayName = "Icon"

module.exports = Icon
