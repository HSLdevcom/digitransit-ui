React = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Link                  = require 'react-router/lib/Link'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'

class TripLink extends React.Component

  render: ->
    console.log "TripLink props", @props

    trip = @props.trip
    type = @props.routeType

    <div className="route-now-content">
      <Link to={trip and "/lahdot/#{trip.gtfsId}"}
            onClick={() => trip?}>
        <Icon className={cx type, 'large-icon'}
              img={'icon-icon_' + type + '-live'}
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
