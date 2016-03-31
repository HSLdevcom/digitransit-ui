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

class SearchModal extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentWillMount: =>
    @context.getStore('SearchStore').addChangeListener @onSearchChange

  componentWillUnmount: =>
    @context.getStore('SearchStore').removeChangeListener @onSearchChange

  onSearchChange: (a) =>
    position = @context.getStore('SearchStore').getDestinationPosition()
    @setState("value": position?.address || "")

  closeModal: () =>
    @context.executeAction SearchActions.closeSearch

  onTabChange: (tab) =>
    @context.executeAction SearchActions.changeActionTarget, tab.props.value

  render: =>
    style = {}
    if @context.getStore('SearchStore').isModalOpen() == false
      style.left = "-400%"
    else
      style.right = "0px"

    <div style={style}
      className="search-modal">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns cursor-pointer search-header">
          <span className="search-header__back-arrow" onClick={@closeModal}>
            <Icon img={'icon-icon_arrow-left'}/>
            <span className="search-header-separator"/>
          </span>
          <Tabs
            inkBarStyle={{display: "none"}}
            tabItemContainerStyle={{backgroundColor: "#eef1f3", lineHeight: "18px", marginLeft: "28px", width: "calc(100% - 28px)"}}
            value={@context.getStore('SearchStore').getActionTarget()}
          >
            <Tab
              className="search-header__button"
              label="Lähtöpaikka"
              value={"origin"}
              onActive={@onTabChange}
              style={{
                color: if @context.getStore('SearchStore').getActionTarget() == "origin" then "#333" else "#7f929c",
                fontSize: "11px",
                fontFamily: "Gotham Rounded SSm A, Gotham Rounded SSm B, Arial, Georgia, Serif",
                fontWeight: "700"}}
            >
              <SearchInput
                ref="searchInput"
                initialValue = {@context.getStore('SearchStore').getOriginPosition()?.address || ""}
                onSuggestionSelected = {(name, item) =>
                  if item.type == 'CurrentLocation'
                    @context.executeAction EndpointActions.setUseCurrent, "origin"
                  else
                    @context.executeAction EndpointActions.setEndpoint,
                      "target": "origin",
                      "endpoint":
                        lat: item.geometry.coordinates[1]
                        lon: item.geometry.coordinates[0]
                        address: name
                  @closeModal()
              }/>
            </Tab>
            <Tab
              className="search-header__button"
              label="Määränpää"
              value={"destination"}
              onActive={@onTabChange}
              style={{
                color: if @context.getStore('SearchStore').getActionTarget() == "destination" then "#333" else "#7f929c",
                fontSize: "11px",
                fontFamily: "Gotham Rounded SSm A, Gotham Rounded SSm B, Arial, Georgia, Serif",
                fontWeight: "700"}}
            >
              <SearchInput
                ref="searchInput"
                initialValue = {@context.getStore('SearchStore').getDestinationPosition()?.address || ""}
                onSuggestionSelected = {(name, item) =>
                  if item.type == 'CurrentLocation'
                    @context.executeAction EndpointActions.setUseCurrent, 'destination'
                  else
                    @context.executeAction EndpointActions.setEndpoint,
                      "target": "destination",
                      "endpoint":
                        lat: item.geometry.coordinates[1]
                        lon: item.geometry.coordinates[0]
                        address: name
                  @closeModal()
              }/>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>

module.exports = SearchModal
