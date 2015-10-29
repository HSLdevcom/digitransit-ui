React = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Link                  = require 'react-router/lib/Link'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'

class TripLink extends React.Component

  render: ->
    <div className="route-now-content">
      <Link key={@props.trip.fuzzyTrip.gtfsId} to="/lahdot/#{@props.trip.fuzzyTrip.gtfsId}">
        <Icon className={cx @props.trip.fuzzyTrip.route.type.toLowerCase(), 'large-icon'}
              img={'icon-icon_' + @props.trip.fuzzyTrip.route.type.toLowerCase() + '-live'}
        />
      </Link>
    </div>


module.exports = Relay.createContainer(TripLink,
  fragments: queries.TripLinkFragments
  initialVariables:
    route: null
    direction: null
    date: null
    time: null
)
