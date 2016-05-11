React               = require 'react'
Relay               = require 'react-relay'
Config              = require '../../config'
DefaultNavigation   = require('../navigation/DefaultNavigation').default
FrontPagePanel      = require '../front-page/front-page-panel'
EndpointActions     = require '../../action/endpoint-actions'
{intlShape}         = require 'react-intl'
FormattedMessage    = require('react-intl').FormattedMessage
OneTabSearchModal   = require '../search/one-tab-search-modal'
FakeSearchBar       = require '../search/fake-search-bar'
FakeSearchWithButton = require '../search/fake-search-with-button'

class Splash extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  constructor: -> #modal
    @state =
      searchModalIsOpen: false

  closeModal: () =>
    @setState
      searchModalIsOpen: false

  render: ->
    ownPosition = @context.intl.formatMessage
      id: 'own-position'
      defaultMessage: 'Your current location'

    initialValue = ""

    destinationPlaceholder = @context.intl.formatMessage
      id: 'destination-placeholder'
      defaultMessage: 'Where to? - address or stop'

    fakeSearchBar =
      <FakeSearchBar
        placeholder={destinationPlaceholder}
        id="front-page-search-bar"
      />

    <div className="fullscreen">
      <DefaultNavigation
        className="fullscreen"
        disableBackButton
        title={Config.title}>
        <div className="fullscreen splash-map">
          <FakeSearchWithButton fakeSearchBar={fakeSearchBar}/>
          <FrontPagePanel/>
        </div>
      </DefaultNavigation>

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
                  searchModalIsOpen: true}>
                <FormattedMessage id="give-origin"  defaultMessage="Type in your origin"/><br/><br/>
              </span>
              <span className="cursor-pointer dotted-link medium" onClick={() =>
                @context.executeAction EndpointActions.setOriginToDefault
              }><FormattedMessage id='skip-positioning' defaultMessage='Skip' /></span>
            </div>
          }
        </div>
        <OneTabSearchModal
          modalIsOpen={@state.searchModalIsOpen}
          closeModal={@closeModal}
          initialValue=""
          target={"origin"}
        />
      </div>
    </div>

module.exports = Splash
