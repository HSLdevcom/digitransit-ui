React                 = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
Example               = require '../documentation/example-data'
Link                  = require 'react-router/lib/Link'

FavouriteLocation = (props) =>

  if props.empty
    <Link to="/lisaa-suosikki" className="cursor-pointer no-decoration">
      <div className={cx "new-favourite-button-content", props.className}>
          <Icon img="icon-icon_plus" className="add-new-favourite-icon"/>
          <p className="add-location-text"><FormattedMessage id='add-location' defaultMessage='Add location'/></p>
      </div>
    </Link>
  else
    <div
      className={cx "favourite-location-content", props.className}
      onClick={props.clickFavourite.bind this, props.locationName, props.lat, props.lon}>
        <div className="favourite-location-header">{props.locationName}</div>
        <div className="favourite-location-arrival">
          <span className="favourite-location-icon"><Icon img={props.favouriteLocationIconId}/></span>
          <span className="favourite-location-arrival-time">{props.arrivalTime}</span>
        </div>
        <div className="favourite-location-departure hidden">
          <Icon img="icon-icon_walk" className="favourite-location-departure-icon"/>
          <span className={"favourite-location-departure-time" + if props.realtime then "--realtime" else ""}>
            {props.departureTime}
          </span>
        </div>
    </div>

FavouriteLocation.description =
  <div>
    <p>Renders a favourite location component</p>
    <ComponentUsageExample description="">
      <FavouriteLocation
        locationName={Example.favouriteLocation.locationName}
        favouriteLocationIconId={'icon-icon_place'}
        arrivalTime={Example.favouriteLocation.arrivalTime}
        departureTime={Example.favouriteLocation.departureTime}
        empty={Example.favouriteLocation.empty}
        clickFavourite={() -> return}
        realtime={Example.favouriteLocation.realtime}/>
    </ComponentUsageExample>
  </div>

FavouriteLocation.propTypes =
  empty: React.PropTypes.bool.isRequired
  addFavourite: React.PropTypes.func
  clickFavorite: React.PropTypes.func
  className: React.PropTypes.string
  locationName: React.PropTypes.string
  favouriteLocationIconId: React.PropTypes.string
  arrivalTime: React.PropTypes.string
  departureTime: React.PropTypes.string
  realtime: React.PropTypes.bool

FavouriteLocation.displayName = "FavouriteLocation"


module.exports = FavouriteLocation
