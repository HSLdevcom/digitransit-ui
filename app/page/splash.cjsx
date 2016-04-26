React               = require 'react'
Relay               = require 'react-relay'
queries             = require '../queries'
IndexNavigation     = require '../component/navigation/index-navigation'
FrontPagePanel      = require '../component/front-page/front-page-panel'
SearchMainContainer = require '../component/search/search-main-container'
Icon                = require '../component/icon/icon'
Link                = require 'react-router/lib/Link'
MapWithTracking     = require '../component/map/map-with-tracking'
FeedbackPanel       = require '../component/feedback/feedback-panel'
PositionActions     = require '../action/position-actions'
EndpointActions     = require '../action/endpoint-actions'
SearchModal         = require '../component/search/search-modal'
SearchInput         = require '../component//search/search-input'
Tab                 = require 'material-ui/lib/tabs/tab'
{intlShape}         = require 'react-intl'
Icon                = require '../component/icon/icon'

class Splash extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  constructor: ->
    @state =
      origin: undefined
      destination: undefined
      tabOpen: false

  closeModal: () =>
    @setState
      tabOpen: false

  getLoading: =>
    <IndexNavigation className="fullscreen">
      <SearchMainContainer/>
      <FrontPagePanel/>
      Ladataan yadda yadda
    </IndexNavigation>

  getPositioning: =>

    <IndexNavigation className="fullscreen">
      <SearchMainContainer/>
      <FrontPagePanel/>
      Paikannetaan yadda yadda!
      <div onClick={() ->
        @context.executeAction EndpointActions.setOriginToDefault
      }>Skip positioning</div>
      <div onClick={() => @setState(tabOpen: "origin")}>Kirjoita lähtöpaikka</div>

    </IndexNavigation>

  render: ->
    ownPosition = @context.intl.formatMessage
      id: 'own-position'
      defaultMessage: 'Your current location'

    initialValue =
      if @state[@state.tabOpen]
        if @state[@state.tabOpen].useCurrentPosition
          ownPosition
        else
          @state[@state.tabOpen].address
      else
        ""

    <div className="fullscreen">
      {
        if @props?.state == "load"
          @getLoading()
        else
          @getPositioning()
      }
      <SearchModal
        ref="modal"
        selectedTab="tab"
        modalIsOpen={@state.tabOpen}
        closeModal={@closeModal}>
        <Tab
          className="search-header__button--selected"
          label={@context.intl.formatMessage
            id: @state.tabOpen or "origin"
            defaultMessage: @state.tabOpen}
          ref="searchTab"
          value="tab">
          <SearchInput
            initialValue = {initialValue}
            type="endpoint"
            onSuggestionSelected = {(name, item) =>
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
          }/>
      </Tab>
      </SearchModal>
    </div>

module.exports = Splash
