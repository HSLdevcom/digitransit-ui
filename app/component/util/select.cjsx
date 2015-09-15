React       = require 'react'

class Select extends React.Component
  @propTypes:
    onSelectChange: React.PropTypes.func.isRequired


  getOptionTags: (options) ->
    options.map (option, index) ->
      <option key={option.displayName + option.value} value={option.value}>
        {option.displayName}
      </option>

  render: ->
    <div>
      <h3>{@props.headerText}</h3>
      <select id="test" onChange={@props.onSelectChange} value={@props.selected}>
         {@getOptionTags(@props.options)}
      </select>
    </div>

module.exports = Select
