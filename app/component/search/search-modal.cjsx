React            = require 'react'
MaterialModal    = require 'material-ui/lib/dialog'
Icon             = require '../icon/icon'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchInput      = require './search-input'
SearchActions    = require '../../action/search-actions'
EndpointActions  = require '../../action/endpoint-actions'
Tabs             = require 'material-ui/lib/tabs/tabs'
Tab              = require 'material-ui/lib/tabs/tab'
config           = require '../../config'

class SearchModal extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: =>
    if !@props.modalIsOpen
      return false
    else
      <div
        className="search-modal">
        <div className="row">
          <div className="small-12 medium-6 medium-offset-3 columns cursor-pointer search-header">
            <span className="search-header__back-arrow" onClick={@props.closeModal}>
              <Icon img={'icon-icon_arrow-left'}/>
              <span className="search-header-separator"/>
            </span>
            <Tabs
              className={"search-header__tabs-root"}
              inkBarStyle={{backgroundColor: config.colors.primary, bottom: "auto", top: -43}}
              value={@props.selectedTab}
            >
            {@props.children}
            </Tabs>
          </div>
        </div>
      </div>

module.exports = SearchModal
