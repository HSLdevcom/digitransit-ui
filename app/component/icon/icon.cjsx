React = require 'react'

if window?
  require './icon.css'

class Icon extends React.Component

  propTypes =
    img: React.PropTypes.string.isRequired

  render: ->
    clazz = ""
    if @props.className
      clazz = @props.className

    id = ""
    if @props.id
      id = "id=" + @props.id + " " # Adding the space here, as otherwise it leads to different number of spaceis in server-side vs client-side html due to minification

    html = """<svg #{id}viewBox="0 0 40 40" class="icon #{clazz}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="##{@props.img}"></use></svg>#{if @props.children then @props.children else ""}"""
    <span dangerouslySetInnerHTML={{__html: html}} />

module.exports = Icon
