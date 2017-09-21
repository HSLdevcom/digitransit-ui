import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import { intlShape } from 'react-intl';

import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import TimeFrame from './TimeFrame';
import DateWarning from './DateWarning';
import ItineraryLegs from './ItineraryLegs';
import LegAgencyInfo from './LegAgencyInfo';
import CityBikeMarker from './map/non-tile-layer/CityBikeMarker';
import SecondaryButton from './SecondaryButton';

class ItineraryTab extends React.Component {
  static propTypes = {
    searchTime: PropTypes.number.isRequired,
    itinerary: PropTypes.object.isRequired,
    location: PropTypes.object,
    focus: PropTypes.func.isRequired,
  };

  static contextTypes = {
    breakpoint: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    intl: intlShape.isRequired,
  };

  state = {
    fullscreen: false,
    lat: undefined,
    lon: undefined,
  };

  getState = () => ({
    lat: this.state.lat || this.props.itinerary.legs[0].from.lat,
    lon: this.state.lon || this.props.itinerary.legs[0].from.lon,
  });

  handleFocus = (lat, lon) => {
    this.props.focus(lat, lon);

    return this.setState({
      lat,
      lon,
    });
  };

  printItinerary = e => {
    e.stopPropagation();
    const printPath = `${this.props.location.pathname}/tulosta`;
    this.context.router.push({
      ...this.props.location,
      pathname: printPath,
    });
  };

  render() {
    const config = this.context.config;
    const routeInformation =
      config.showRouteInformation && <RouteInformation />;

    return (
      <div className="itinerary-tab">
        {this.context.breakpoint !== 'large' &&
          <ItinerarySummary itinerary={this.props.itinerary}>
            <TimeFrame
              startTime={this.props.itinerary.startTime}
              endTime={this.props.itinerary.endTime}
              refTime={this.props.searchTime}
              className="timeframe--itinerary-summary"
            />
          </ItinerarySummary>}
        {this.context.breakpoint === 'large' &&
          <div className="itinerary-timeframe">
            <DateWarning
              date={this.props.itinerary.startTime}
              refTime={this.props.searchTime}
            />
          </div>}
        <div className="momentum-scroll itinerary-tabs__scroll">
          <div
            className={cx('itinerary-main', {
              'bp-large': this.context.breakpoint === 'large',
            })}
          >
            <ItineraryLegs
              itinerary={this.props.itinerary}
              focusMap={this.handleFocus}
            />
            {config.showTicketInformation &&
              <TicketInformation fares={this.props.itinerary.fares} />}
            {routeInformation}
          </div>
          <div className="row print-itinerary-button-container">
            <SecondaryButton
              buttonParams={{
                ariaLabel: 'print',
                buttonName: 'print',
                buttonIcon: 'icon-icon_print',
                buttonClickAction: e => this.printItinerary(e),
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(ItineraryTab, {
  fragments: {
    searchTime: () => Relay.QL`
      fragment on Plan {
        date
      }
    `,
    itinerary: () => Relay.QL`
      fragment on Itinerary {
        walkDistance
        duration
        startTime
        endTime
        fares {
          type
          currency
          cents
          components {
            fareId
          }
        }
        legs {
          mode
          ${LegAgencyInfo.getFragment('leg')}
          from {
            lat
            lon
            name
            vertexType
            bikeRentalStation {
              ${CityBikeMarker.getFragment('station')}
            }
            stop {
              gtfsId
              code
              platformCode
            }
          }
          to {
            lat
            lon
            name
            vertexType
            bikeRentalStation {
              ${CityBikeMarker.getFragment('station')}
            }
            stop {
              gtfsId
              code
              platformCode
            }
          }
          legGeometry {
            length
            points
          }
          intermediateStops {
            gtfsId
            lat
            lon
            name
            code
            platformCode
          }
          realTime
          transitLeg
          rentedBike
          startTime
          endTime
          mode
          distance
          duration
          intermediatePlace
          route {
            shortName
            color
            gtfsId
            longName
            agency {
              phone
            }
          }
          trip {
            gtfsId
            tripHeadsign
            pattern {
              code
            }
            stoptimes {
              pickupType
              stop {
                gtfsId
              }
            }
          }
        }
      }
    `,
  },
});
