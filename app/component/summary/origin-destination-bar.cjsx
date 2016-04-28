React               = require 'react'
EndpointActions     = require '../../action/endpoint-actions'
SearchModal         = require '../search/search-modal'
GeolocationOrInput  = require '../search/geolocation-or-input'
Tab                 = require('material-ui/Tabs/Tab').default
{intlShape}         = require 'react-intl'
Icon                = require '../icon/icon'
OneTabSearchModal   = require '../search/one-tab-modal'

class OriginDestinationBar extends React.Component

  constructor: ->
    @state =
      origin: undefined
      destination: undefined
      tabOpen: false

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  componentWillMount: =>
    @onEndpointChange()
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  onEndpointChange: () =>
    @setState
      origin: @context.getStore('EndpointStore').getOrigin()
      destination: @context.getStore('EndpointStore').getDestination()

  closeModal: () =>
    @setState
      tabOpen: false

  # TODO: This is pretty much copy pasted from search-main-container.
  #       Perhaps some kind of higher level component is needed?
  openSearch: (tab) =>
    @setState
      tabOpen: tab
      () ->
        setTimeout(
          (() => @refs.oneTabModal?.refs.searchInput?.refs.searchInput.refs.autowhatever?.refs.input?.focus()),
          0) #try to focus, does not work on ios

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

    <div className="origin-destination-bar">
      <div className="field-link" onClick={() => @openSearch("origin")}>
        <span>{if @state.origin.useCurrentPosition then ownPosition else @state.origin.address}</span>
      </div>
      <div className="switch" onClick={() => @context.executeAction EndpointActions.swapEndpoints}>
        <span><Icon img="icon-icon_direction-b"/></span>
      </div>
      <div className="field-link" onClick={() => @openSearch("destination")}>
        <span>{if @state.destination.useCurrentPosition then ownPosition else @state.destination.address}</span>
      </div>
      <OneTabSearchModal
        ref="oneTabModal"
        tabOpen={@state.tabOpen}
        closeModal={@closeModal}
        tabLabel={@state.tabOpen or "origin"}
        initialValue={initialValue}
        endpoint={if @state[@state.tabOpen] != undefined then Object.assign(@state[@state.tabOpen], {target: @state.tabOpen}) else undefined}
      />
    </div>

module.exports = OriginDestinationBar
