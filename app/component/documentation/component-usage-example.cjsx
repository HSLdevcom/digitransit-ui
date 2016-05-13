React       = require 'react'

###
  Renders the components given as children. In addition a string represenation
  of the given components and its props are given.
  Can be combined with ComponentDocumentation

  usage:
  <ComponentUsageExample description="description of the example">
    <YourComponent foo=bar className="padding-normal"/>
  </ComponentUsageExample>
###
class ComponentUsageExample extends React.Component
  @propTypes:
    description: React.PropTypes.string

  getPropStrings: (props) ->
    (for key, value of props
      switch typeof value
        when 'string'
          "#{key}='#{value}'" if key != 'children'
        when 'object'
          "#{key}={" + (("#{key1}: #{value1}" for key1, value1 of value).join ", ") + "}"
        else
          "#{key}={#{value}}"
    ).join " "

  getChild: (child) ->
    <div>
      <span className="code">
        {"<#{child.type.displayName || child.type.name} #{@getPropStrings child.props}/>"}
      </span>
      <div className="component border-dashed">{child}</div>
    </div>

  render: ->
    description = ""
    if @props.description
      description = <p>{@props.description}</p>

    <div className="component-example padding-vertical-normal">
      {description}
      {React.Children.map @props.children, (child) => @getChild(child)}
    </div>

module.exports = ComponentUsageExample
