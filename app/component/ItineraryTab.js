import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import cx from 'classnames';

import TicketInformation from './TicketInformation';
import RouteInformation from './RouteInformation';
import ItinerarySummary from './ItinerarySummary';
import TimeFrame from './TimeFrame';
import config from '../config';
import ItineraryLegs from './ItineraryLegs';
import LegAgencyInfo from './LegAgencyInfo';
import CityBikeMarker from './map/non-tile-layer/CityBikeMarker';

const routeInformation = config.showRouteInformation && <RouteInformation />;

class ItineraryTab extends React.Component {
  static propTypes = {
    itinerary: PropTypes.object.isRequired,
    focus: PropTypes.func.isRequired,
  };

  static contextTypes = {
    breakpoint: React.PropTypes.string.isRequired,
  }

  state = {
    fullscreen: false,
    lat: undefined,
    lon: undefined,
  };

  shouldComponentUpdate = () => false

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
  }

  render() {
    return (
      <div className="itinerary-tab">
        {this.context.breakpoint !== 'large' &&
          <ItinerarySummary itinerary={this.props.itinerary}>
            <TimeFrame
              startTime={this.props.itinerary.startTime}
              endTime={this.props.itinerary.endTime}
              className="timeframe--itinerary-summary"
            />
          </ItinerarySummary>
        }
        <div className="momentum-scroll itinerary-tabs__scroll">
          <div
            className={cx('itinerary-main', { 'bp-large': this.context.breakpoint === 'large' })}
          >
            <ItineraryLegs
              itinerary={this.props.itinerary}
              focusMap={this.handleFocus}
            />
            {config.showTicketInformation &&
              <TicketInformation fares={this.props.itinerary.fares} />}
            {routeInformation}
          </div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(ItineraryTab, {
  fragments: {
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
          route {
            shortName
            gtfsId
          }
          trip {
            gtfsId
            tripHeadsign
            pattern {
              code
            }
          }
        }
      }
    `,
  },
});
