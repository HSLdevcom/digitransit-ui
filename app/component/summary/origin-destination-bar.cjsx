React               = require 'react'
EndpointActions     = require('../../action/EndpointActions')
{intlShape}         = require 'react-intl'
Icon                = require '../icon/icon'
OneTabSearchModal   = require '../search/one-tab-search-modal'

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

  openSearch: (tab) =>
    @setState
      tabOpen: tab

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
        <span className="dotted-link">{if @state.origin.useCurrentPosition then ownPosition else @state.origin.address}</span>
      </div>
      <div className="switch" onClick={() => @context.executeAction EndpointActions.swapEndpoints}>
        <span><Icon img="icon-icon_direction-b"/></span>
      </div>
      <div className="field-link" onClick={() => @openSearch("destination")}>
        <span className="dotted-link">{if @state.destination.useCurrentPosition then ownPosition else @state.destination.address}</span>
      </div>
      <OneTabSearchModal
        modalIsOpen={@state.tabOpen}
        closeModal={@closeModal}
        initialValue={initialValue}
        endpoint={@state[@state.tabOpen]}
        target={@state.tabOpen}
      />
    </div>

module.exports = OriginDestinationBar
