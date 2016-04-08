React           = require 'react'
FakeSearchBar   = require './fake-search-bar'

class SearchField extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    endpoint: React.PropTypes.object.isRequired
    autosuggestPlaceholder: React.PropTypes.string.isRequired
    id: React.PropTypes.string.isRequired
    onClick: React.PropTypes.func.isRequired
    className: React.PropTypes.string

  render: =>
    <div id={@props.id} onClick={(e) =>
      @props.onClick(e)
      }>
      <FakeSearchBar
        className={@props.className}
        onClick={@props.onClick}
        placeholder={@props.autosuggestPlaceholder}
        value={@props.endpoint?.address}
        id={@props.id + "-fake-search-bar"}
      />
    </div>

module.exports = SearchField
