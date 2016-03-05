React       = require 'react'
Link                  = require 'react-router/lib/Link'
Icon                  = require '../icon/icon'
{FormattedMessage} = require('react-intl')

MarkerPopupBottom = (props) ->

  <div className="bottom location">
    {props.children}
    <Link to={props.routeHere} className="route">
      <Icon img={'icon-icon_route'}/> <FormattedMessage id="route-here" defaultMessage="Route to here" />
    </Link>
  </div>

MarkerPopupBottom.displayName = "MarkerPopupBottom"

module.exports = MarkerPopupBottom
