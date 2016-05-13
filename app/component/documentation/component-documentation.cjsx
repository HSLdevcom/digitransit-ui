React       = require 'react'

###
  Displays a card with the information of the given component as prop
  It renders the components propTypes and description

  usage:
  <ComponentDocumentation component=YourComponent>
  </ComponentDocumentation>
###
class ComponentDocumentation extends React.Component
  @propTypes:
    component: React.PropTypes.func.isRequired

  render: ->
    <div className="card padding-normal" id={@props.component.displayName || @props.component.name}>
      <h2>{@props.component.displayName || @props.component.name}</h2>
      <p>{@props.component.description}</p>
      <p>Props:</p>
      <ul>
        {<li>{key}</li> for key, value of @props.component.propTypes}
      </ul>

      {@props.children}
    </div>

module.exports = ComponentDocumentation
