React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
FavouriteRouteRow     = require './favourite-route-row'
config                = require '../../config'

class FavouriteRouteListContainer extends React.Component

  proptypes: {
    routes: React.PropTypes.array
  }

  getRoutes: =>
    routes = []
    for route in @props.routes.routes
      routes.push <FavouriteRouteRow key={route.patterns[0].code} route={route}></FavouriteRouteRow>
    routes

  render: =>
    <div className="row">
      {@getRoutes()}
    </div>



module.exports = Relay.createContainer(FavouriteRouteListContainer,
  fragments: queries.FavouriteRouteRowFragments
  initialVariables:
    ids: null
)
