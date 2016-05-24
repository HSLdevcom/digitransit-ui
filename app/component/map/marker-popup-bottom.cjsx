React              = require 'react'
Icon               = require '../icon/icon'
{FormattedMessage} = require('react-intl')
EndpointActions    = require('../../action/EndpointActions')

MarkerPopupBottom = ({location}, {executeAction}) ->
  routeFrom = () ->
    executeAction EndpointActions.setEndpoint,
      target: 'origin'
      endpoint: location

  routeTo = () ->
    executeAction EndpointActions.setEndpoint,
      target: 'destination'
      endpoint: location

  <div className="bottom location">
    <div onClick={routeFrom} className="route cursor-pointer">
      <Icon img={'icon-icon_route'}/> <FormattedMessage id="route-from-here" defaultMessage="Route from here" />
    </div>
    <div onClick={routeTo} className="route cursor-pointer">
      <Icon img={'icon-icon_route'}/> <FormattedMessage id="route-here" defaultMessage="Route to here" />
    </div>
  </div>

MarkerPopupBottom.displayName = "MarkerPopupBottom"

MarkerPopupBottom.contextTypes =
  executeAction: React.PropTypes.func.isRequired

module.exports = MarkerPopupBottom
