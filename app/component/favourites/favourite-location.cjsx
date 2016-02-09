React                 = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')

FavouriteLocation = (props) ->

  if props.empty
    #TODO: add empty layout, DT-669
    <div className={cx "favourite-location-content", props.className}>
      "testi"
    </div>
  else
    <div className={cx "favourite-location-content", props.className} onClick={props.clickFavourite}>
      <NotImplementedLink
        nonTextLink={true}
        name={<FormattedMessage id='favourites' defaultMessage='Favourites'/>}
        className="no-decoration"
      >
        <div className="favourite-location-header">{props.locationName}</div>
        <div className="favourite-location-arrival">
          <span className="favourite-location-icon">{props.favouriteLocationIcon}</span>
          <span className="favourite-location-arrival-time">{props.arrivalTime}</span>
        </div>
        <div className="favourite-location-departure">
          <Icon img="icon-icon_walk" className="favourite-location-departure-icon"/>
          <span className={"favourite-location-departure-time" + if props.realtime then "--realtime" else ""}>
            {props.departureTime}
          </span>
        </div>
      </NotImplementedLink>
    </div>


FavouriteLocation.displayName = "FavouriteLocation"

FavouriteLocation.description =
  <div>
    <p>Renders a favourite location component</p>
    <ComponentUsageExample description="">
      <FavouriteLocation empty={true}/>
    </ComponentUsageExample>
  </div>

FavouriteLocation.propTypes =
  empty: React.PropTypes.bool.isRequired
  addFavourite: React.PropTypes.func
  clickFavorite: React.PropTypes.func
  className: React.PropTypes.string
  locationName: React.PropTypes.string
  favouriteLocationIcon: React.PropTypes.object
  arrivalTime: React.PropTypes.string
  departureTime: React.PropTypes.string
  realtime: React.PropTypes.bool


module.exports = FavouriteLocation
