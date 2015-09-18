React = require 'react'

if window?
  require './icon.css'

module.exports = (props) ->
  <span>
    <svg id={props.id} viewBox="0 0 40 40" className={"icon #{props.className}"}>
      <use xlinkHref="##{props.img}"/>
    </svg>
  </span>


module.exports.displayName = "Icon"
