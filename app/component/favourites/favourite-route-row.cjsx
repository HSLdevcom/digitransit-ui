React                 = require 'react'
Icon                  = require '../icon/icon'
Link                  = require 'react-router/lib/Link'
classNames            = require 'classnames'
FavouriteRouteActions = require '../../action/favourite-routes-action'

class FavouriteRouteRow extends React.Component

  proptypes: {
    route: React.PropTypes.object.isRequired
  }

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired


  addFavouriteRoute: (e) =>
    @context.executeAction FavouriteRouteActions.addFavouriteRoute, @props.route.gtfsId

  render: =>
    className = @props.route.type.toLowerCase()
    <div key={@props.route.gtfsId} className="small-12 medium-6 large-4 columns">
        <div className="card padding-small cursor-pointer">
          <p className="transport route-detail-text no-padding no-margin">
          <Link to="#{process.env.ROOT_PATH}linjat/#{@props.route.gtfsId}:0:01" className="no-decoration"><Icon className={className} img={'icon-icon_' + className}/><span className={"vehicle-number " + className}>{@props.route.shortName}</span><span className="destination"> - {@props.route.longName}</span></Link>
            <span className="cursor-pointer favourite-icon right" onClick={@addFavouriteRoute}>
              <Icon className={classNames "favourite", selected: true} img="icon-icon_star"/>
            </span>
          </p>
        </div>
    </div>

module.exports = FavouriteRouteRow
