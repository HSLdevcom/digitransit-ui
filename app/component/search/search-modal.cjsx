React            = require 'react'
MaterialModal    = require 'material-ui/lib/dialog'
Icon             = require '../icon/icon'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchInput      = require './search-input'
SearchActions    = require '../../action/search-actions'

class SearchModal extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentWillMount: =>
    @context.getStore('SearchStore').addChangeListener @onSearchChange

  componentWillUnmount: =>
    @context.getStore('SearchStore').removeChangeListener @onSearchChange

  onSearchChange: (a) =>
    position = @context.getStore('SearchStore').getPosition()
    @setState("value": position?.address || "")

  closeModal: () =>
    @context.executeAction SearchActions.closeSearch

  render: =>
    style = {}

    if @context.getStore('SearchStore').isModalOpen() == false
      style.height = "0"
    else
      style.height = "100vh"

    <div style={style}
      className="search-modal">
      <div className="row cursor-pointer padding-none" onClick={@closeModal}>
        <div className="small-12 medium-6 medium-offset-3 columns">
          <Icon img={'icon-icon_arrow-left'} />
        </div>
      </div>
      <div className="row">
      <div className="small-12 medium-6 medium-offset-3 columns">
      <SearchInput
        ref="searchInput"
        initialValue = {@state?.value}
        onSuggestionSelected = {(name, item) =>
          setLocationAction = @context.getStore('SearchStore').getAction()
          @context.executeAction setLocationAction,
            lat: item.geometry.coordinates[1]
            lon: item.geometry.coordinates[0]
            address: name

          @closeModal()
      }/>
      </div>
      </div>
    </div>

module.exports = SearchModal
