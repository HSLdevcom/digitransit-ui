React            = require 'react'
MaterialModal    = require 'material-ui/lib/dialog'
Icon             = require '../icon/icon'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchInput      = require './search-input'
SearchActions    = require '../../action/search-actions'
EndpointActions  = require '../../action/endpoint-actions'

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
      style.left = "-400%"
    else
      style.right = "0px"

    <div style={style}
      className="search-modal">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns cursor-pointer search-header" onClick={@closeModal}>
          <Icon img={'icon-icon_arrow-left'} />
          <span className="search-header-separator"/>
        </div>
      </div>
      <div className="row">
      <div className="small-12 medium-6 medium-offset-3 columns">
      <SearchInput
        ref="searchInput"
        initialValue = {@state?.value}
        onSuggestionSelected = {(name, item) =>
          action = @context.getStore('SearchStore').getAction()

          if action != undefined
            action(name, item)
            @closeModal()
            return

          actionTarget = @context.getStore('SearchStore').getActionTarget()

          if item.type == 'CurrentLocation'
            @context.executeAction EndpointActions.setUseCurrent, actionTarget
          else
            @context.executeAction EndpointActions.setEndpoint,
              "target": actionTarget,
              "endpoint":
                lat: item.geometry.coordinates[1]
                lon: item.geometry.coordinates[0]
                address: name

          @closeModal()
      }/>
      </div>
      </div>
    </div>

module.exports = SearchModal
