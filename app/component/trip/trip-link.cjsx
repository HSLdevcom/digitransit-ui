React = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Link                  = require 'react-router/lib/Link'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
FormattedMessage      = require('react-intl').FormattedMessage

class TripLink extends React.Component

  render: ->
    icon =
      <Icon
        className={cx @props.routeType, 'large-icon'}
        img={'icon-icon_' + @props.routeType + '-live'}
      />

    if @props.trip.trip
      <Link to={@props.trip.trip and "/lahdot/#{@props.trip.trip.gtfsId}"} className="route-now-content">
        {icon}
      </Link>
    else # We cannot match. TODO.
      <div className="route-now-content">
        <NotImplementedLink nonTextLink={true} name={<FormattedMessage id="realtime-matching" defaultMessage="Realtime matching"/>}>
          {icon}
        </NotImplementedLink>
      </div>


module.exports = Relay.createContainer(TripLink,
  fragments: queries.TripLinkFragments
  initialVariables:
    route: null
    direction: null
    date: null
    time: null
)
