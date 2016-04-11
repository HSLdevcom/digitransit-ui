React           = require 'react'
FakeSearchBar   = require './fake-search-bar'

class SearchField extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    autosuggestPlaceholder: React.PropTypes.string.isRequired
    id: React.PropTypes.string.isRequired
    onClick: React.PropTypes.func.isRequired
    endpoint: React.PropTypes.object
    className: React.PropTypes.string

  render: =>
    <div id={@props.id} onClick={@props.onClick}>
      <FakeSearchBar
        className={@props.className}
        placeholder={@props.autosuggestPlaceholder}
        value={@props.endpoint?.address}
        id={@props.id + "-fake-search-bar"}
      />
    </div>

module.exports = SearchField
