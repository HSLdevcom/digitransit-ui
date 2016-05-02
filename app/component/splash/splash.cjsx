React               = require 'react'
Relay               = require 'react-relay'
IndexNavigation     = require '../navigation/index-navigation'
FrontPagePanel      = require '../front-page/front-page-panel'
SearchMainContainer = require '../search/search-main-container'
Icon                = require '../icon/icon'
Link                = require 'react-router/lib/Link'
PositionActions     = require '../../action/position-actions'
EndpointActions     = require '../../action/endpoint-actions'
SearchModal         = require '../search/search-modal'
SearchInput         = require '../search/search-input'
Tab                 = require('material-ui/Tabs/Tab').default
{intlShape}         = require 'react-intl'
FormattedMessage    = require('react-intl').FormattedMessage

class Splash extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  constructor: -> #modal
    @state =
      origin: undefined
      destination: undefined
      tabOpen: false

  closeModal: () =>
    @setState
      tabOpen: false

  render: ->
    ownPosition = @context.intl.formatMessage
      id: 'own-position'
      defaultMessage: 'Your current location'

    initialValue = ""

    <div className="fullscreen">
      <IndexNavigation className="fullscreen">
        <div className="fullscreen splash-map">
          <SearchMainContainer/>
          <FrontPagePanel/>
        </div>
      </IndexNavigation>

      <div className="splash">
        <div className="top"/>
        <div className="mid">
          <div className="spinner-loader"/>
        </div>
        <div className="bottom">
          { if @props?.state == "load" then <h2><FormattedMessage id='loading' defaultMessage='Loading...' /></h2>else
            <div><h2 className="state"><FormattedMessage id='searching-position' defaultMessage='Searching position...' /></h2>
              <FormattedMessage id="or" defaultMessage="Or"/><br/>
              <span className="cursor-pointer dotted-link medium" onClick={() =>
                @setState
                  tabOpen: "origin"
                  searchModalIsOpen: true}>
                <FormattedMessage id="give-origin"  defaultMessage="Type in your origin"/><br/><br/>
              </span>
              <span className="cursor-pointer dotted-link medium" onClick={() =>
                @context.executeAction EndpointActions.setOriginToDefault
              }><FormattedMessage id='skip-positioning' defaultMessage='Skip' /></span>
            </div>
          }
        </div>
        <SearchModal
          ref="modal"
          selectedTab="tab"
          modalIsOpen={@state.tabOpen}
          closeModal={@closeModal}>
          <Tab className="search-header__button--selected"
          label={@context.intl.formatMessage
            id: @state.tabOpen or "origin"
            defaultMessage: @state.tabOpen}
          ref="originTab"
          value="tab"
          >
            <SearchInput
              initialValue = {initialValue}
              type="endpoint"
              onSuggestionSelected = {
                (name, item) =>
                  if item.type == 'CurrentLocation'
                    @context.executeAction EndpointActions.setUseCurrent, @state.tabOpen
                  else
                    @context.executeAction EndpointActions.setEndpoint,
                      "target": @state.tabOpen,
                      "endpoint":
                        lat: item.geometry.coordinates[1]
                        lon: item.geometry.coordinates[0]
                        address: name
                  @context.executeAction EndpointActions.displayOriginPopup
                  @closeModal()
              }
            />
          </Tab>
        </SearchModal>
      </div>
    </div>

module.exports = Splash
