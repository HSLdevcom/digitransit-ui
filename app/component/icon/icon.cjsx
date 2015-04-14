React = require 'react'

class Icon extends React.Component
  
  propTypes =
    img: React.PropTypes.string.isRequired
    action: React.PropTypes.boolean

  render: ->
    clazz = ""
    if @props.className
      clazz = @props.className

    id = ""
    if @props.id
      id = "id=" + @props.id

    html = """
      <svg #{id} viewBox="0 0 40 40" class="icon #{clazz}">
        <use xlink:href="##{@props.img}"></use>
      </svg>
    """
    <span dangerouslySetInnerHTML={{__html: html}} />

module.exports = Icon