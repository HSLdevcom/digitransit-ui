React            = require 'react'
MaterialModal    = require('material-ui/Dialog').default
Icon             = require '../icon/icon'
intl             = require 'react-intl'
Tabs             = require('material-ui/Tabs/Tabs').default
config           = require '../../config'

class SearchModal extends React.Component
  render: =>
    if !@props.modalIsOpen
      return false
    else
      <div
        className="search-modal">
        <div className="row fullscreen">
          <div className="small-12 columns cursor-pointer search-header">
            <div className="search-header__back-arrow" onClick={@props.closeModal}>
              <Icon img='icon-icon_arrow-left'/>
              <span className="search-header-separator"/>
            </div>
            <Tabs
              className="search-header__tabs-root"
              inkBarStyle={{backgroundColor: config.colors.primary, bottom: "auto", top: -43}}
              value={@props.selectedTab}
            >
            {@props.children}
            </Tabs>
          </div>
        </div>
      </div>

module.exports = SearchModal
