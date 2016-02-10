React                 = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
Example = require '../documentation/example-data'

FavouriteLocation = (props) =>

  if props.empty
    #TODO: add empty layout, DT-669
    <div className={cx "favourite-location-content", props.className}>
      "testi"
    </div>
  else
    <div className={cx "favourite-location-content", props.className} onClick={props.clickFavourite}>
      <NotImplementedLink
        nonTextLink={true}
        name={<FormattedMessage id='your-favourites' defaultMessage='Favourites'/>}
        className="no-decoration"
      >
        <div className="favourite-location-header">{props.locationName}</div>
        <div className="favourite-location-arrival">
          <span className="favourite-location-icon"><Icon img={props.favouriteLocationIconId}/></span>
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
