React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
NextDeparturesList = require '../departure/next-departures-list'
config             = require '../../config'

class FavouriteRouteListContainer extends React.Component

  @propTypes:
    routes: React.PropTypes.array


  getDepartures: =>
    departures = []
    for route in @props.routes
      departures.push route
    departures

  render: =>
    <div className="row">
        <NextDeparturesList departures={@getDepartures()} />
    </div>



module.exports = Relay.createContainer(FavouriteRouteListContainer,
  fragments: queries.FavouriteRouteListContainerFragments
  initialVariables:
    ids: null
)
