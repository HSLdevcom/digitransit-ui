React                 = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
NotImplementedLink    = require '../util/not-implemented-link'
DepartureTime         = require '../departure/departure-time'
RouteNumber           = require '../departure/route-number'
{FormattedMessage}    = require('react-intl')
Example               = require '../documentation/example-data'
Link                  = require 'react-router/lib/Link'

FavouriteLocation = (props) =>

  if not props.locationName
    <Link to="/lisaa-suosikki" className="cursor-pointer no-decoration">
      <div className={cx "new-favourite-button-content", props.className}>
          <Icon img="icon-icon_plus" className="add-new-favourite-icon"/>
          <p className="add-location-text"><FormattedMessage id='add-location' defaultMessage='Add location'/></p>
      </div>
    </Link>
  else
    timeIsNotPast = props.currentTime < props.departureTime
    if props.arrivalTime and timeIsNotPast
      arrivalTime = <DepartureTime departureTime={props.arrivalTime} realtime={false} currentTime={props.currentTime}/>
    else
      arrivalTime = <div className="favourite-location-content-placeholder">--:--</div>
    if props.departureTime and timeIsNotPast
      departureTime = <DepartureTime departureTime={props.departureTime} realtime={props.firstTransitLeg?.realTime} currentTime={props.currentTime} className="time--small"/>
    else
      departureTime = <div className="favourite-location-content-placeholder time--small">--:--</div>

    if props.firstTransitLeg?.route
      firstTransitLeg = <RouteNumber mode={props.firstTransitLeg.mode} realtime={props.firstTransitLeg.realTime} text={props.firstTransitLeg.route.shortName}/>
    <div
      className={cx "favourite-location-content", props.className}
      onClick={props.clickFavourite.bind this, props.locationName, props.lat, props.lon}>
        <div className="favourite-location-header">{props.locationName}</div>
        <div className="favourite-location-arrival">
          <nobr>
            <span className="favourite-location-icon">
              <Icon img={props.favouriteLocationIconId}/>
            </span>
            <span className="favourite-location-arrival-time">
              {arrivalTime}
            </span>
          </nobr>
        </div>
        <div className="favourite-location-departure">
          {departureTime}
          <nobr>
            <Icon img="icon-icon_arrow-right" className="favourite-location-arrow"/>
            <Icon img="icon-icon_walk" className="favourite-location-departure-icon"/>
          </nobr>
          {firstTransitLeg}
        </div>
    </div>

FavouriteLocation.description =
  <div>
    <p>Renders a favourite location component</p>
    <ComponentUsageExample description="first leg is with a bus">
      <FavouriteLocation
        clickFavourite={() -> return}
        locationName={Example.favouriteLocation.locationName}
        favouriteLocationIconId={'icon-icon_place'}
        arrivalTime={Example.favouriteLocation.arrivalTime}
        departureTime={Example.favouriteLocation.departureTime}
        currentTime={Example.favouriteLocation.currentTime}
        firstTransitLeg={Example.favouriteLocation.firstTransitLeg}
        />
    </ComponentUsageExample>
  </div>

FavouriteLocation.propTypes =
  addFavourite: React.PropTypes.func
  clickFavourite: React.PropTypes.func
  className: React.PropTypes.string
  locationName: React.PropTypes.string
  favouriteLocationIconId: React.PropTypes.string
  arrivalTime: React.PropTypes.number
  departureTime: React.PropTypes.number
  currentTime: React.PropTypes.number
  firstTransitLeg: React.PropTypes.object

FavouriteLocation.displayName = "FavouriteLocation"


module.exports = FavouriteLocation
