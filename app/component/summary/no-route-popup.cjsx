React                = require 'react'
Modal                = require('../util/Modal').default
FormattedMessage     = require('react-intl').FormattedMessage
Icon  = require '../icon/icon'
ComponentUsageExample = require('../documentation/ComponentUsageExample').default

class NoRoutePopup extends React.Component

  @description:
    <div>
      <p>
        Popup informing the user that no route was found.
      </p>
      <ComponentUsageExample>
        <NoRoutePopup/>
      </ComponentUsageExample>
    </div>

  constructor: ->
    super
    @state =
      open: true

  toggle: (state) =>
    if state == true || state == false
      newState = state
    else
      newState = !@state.open

    @setState({open: newState}, () =>
      @forceUpdate())

  render: ->
    <Modal allowClicks=true open={@state.open} title="" toggleVisibility={@toggle}>
      <div className="no-route-found">
        <Icon className="no-route-found-icon" img='icon-icon_no_route_found'/>
            <p>
              <FormattedMessage
                id="no-route-msg"
                defaultMessage="Unfortunately no route was found between the locations you gave. Please change origin and/or destination address."/>
            </p>
            <p>
              <a>
                <FormattedMessage
                  id="close"
                  defaultMessage="Close"/>
              </a>
            </p>
      </div>
    </Modal>

module.exports = NoRoutePopup
