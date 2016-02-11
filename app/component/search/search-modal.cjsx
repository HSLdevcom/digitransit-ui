React            = require 'react'
MaterialModal    = require 'material-ui/lib/dialog'
Icon             = require '../icon/icon'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchInput2     = require './search-input'
SearchActions    = require '../../action/search-actions'
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
    @setState("render": "now") #or forceupdate?

  closeModal: () =>
    @context.executeAction SearchActions.closeSearch

  render: ->
    <MaterialModal
      className="search-modal"
      contentClassName="search-modal-content"
      bodyClassName="search-modal-body"
      autoScrollBodyContent={true}
      modal={true}
      open={@context.getStore('SearchStore').isModalOpen()}
    >
      <div className="small-1 columns left cursor-pointer" onClick={@closeModal}>
        <Icon img={'icon-icon_arrow-left'} />
      </div>
      <div className="search-form">
      <SearchInput2
        value = {@props.value}
        onSuggestionSelected = {(name, item) =>
          setLocationAction = @context.getStore('SearchStore').getAction()
          @context.executeAction setLocationAction,
            lat: item.geometry.coordinates[1]
            lon: item.geometry.coordinates[0]
            address: name

          @closeModal()
      }/>
      </div>
    </MaterialModal>

module.exports = SearchModal
