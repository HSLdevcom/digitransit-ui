import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Relay from 'react-relay/classic';

import { FormattedMessage } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import Icon from './Icon';
import RouteNumber from './RouteNumber';
import LegAgencyInfo from './LegAgencyInfo';
import CityBikeMarker from './map/non-tile-layer/CityBikeMarker';

class PrintableItinerary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraryObj: this.props.itinerary,
    };
  }

  compressLegs = originalLeg => {
    console.log(originalLeg);
    return originalLeg;
  };

  render() {
    console.log(this.props.itinerary);
    // return null;
    // const fare = this.state.itineraryObj.fares ? this.state.itineraryObj.fares[0].components[0].fareId : 0;
    // const waitThreshold = this.context.config.itinerary.waitThreshold * 1000;
    const originalLegs = this.props.itinerary.legs;
    const newLegs = originalLegs.filter(o => o.duration > 10);
    const legs = newLegs.map((o, i) =>
      <div
        key={o.client}
        className={`print-itinerary-leg
        ${o.mode.toLowerCase()}
        `}
      >
        <div className="itinerary-left">
          <div className="itinerary-timestamp">
            {moment(o.startTime).format('HH:mm')}
          </div>
          <div className="itinerary-icon">
            <div className={`special-icon ${o.mode.toLowerCase()}`}>
              <RouteNumber
                mode={o.mode.toLowerCase()}
                vertical={`${true}`}
                text={o.route !== null ? o.route.shortName : null}
              />
            </div>
          </div>
        </div>
        <div className={`itinerary-circleline ${o.mode.toLowerCase()}`}>
          <div className="line-circle">
            {i === 0
              ? <Icon
                  img="icon-icon_mapMarker-point"
                  className="itinerary-icon from from-it"
                />
              : <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={35}
                  height={35}
                  style={{ fill: '#fff', stroke: 'currentColor' }}
                >
                  <circle
                    stroke="white"
                    strokeWidth="9"
                    width={28}
                    cx={17}
                    cy={20}
                    r={13}
                  />
                  <circle strokeWidth="6" width={28} cx={17} cy={20} r={11} />
                </svg>}
          </div>
          <div className={`leg-before-line ${o.mode.toLowerCase()}`} />
        </div>
        <div className="itinerary-center">
          <div className="itinerary-leg-stopname">
            {o.rentedBike !== true
              ? `${o.from.name} `
              : <FormattedMessage
                  id="rent-cycle-at"
                  values={{ station: o.from.name }}
                />}
            {o.from.stop !== null &&
              <span className="stop-code">{`[${o.from.stop.code}]`}</span>}
          </div>
          <div className="itinerary-instruction">
            {o.mode === 'WALK' &&
              <FormattedMessage
                id="walk-distance-duration"
                defaultMessage="Walk {distance} ({duration})"
                values={{
                  distance: displayDistance(
                    parseInt(o.distance, 10),
                    this.context.config,
                  ),
                  duration: durationToString(o.duration * 1000),
                }}
              />}
            {o.mode === 'BICYCLE' &&
              o.rentedBike === false &&
              <FormattedMessage
                id="cycle-distance-duration"
                defaultMessage="Cycle {distance} ({duration})"
                values={{
                  distance: displayDistance(
                    parseInt(o.distance, 10),
                    this.context.config,
                  ),
                  duration: durationToString(o.duration * 1000),
                }}
              />}
            {o.mode === 'BICYCLE' &&
              o.rentedBike === true &&
              <FormattedMessage
                id="cycle-distance-duration"
                defaultMessage="Cycle {distance} ({duration})"
                values={{
                  distance: displayDistance(
                    parseInt(o.distance, 10),
                    this.context.config,
                  ),
                  duration: durationToString(o.duration * 1000),
                }}
              />}
            {o.mode === 'CAR' &&
              <FormattedMessage
                id="car-distance-duration"
                defaultMessage="Drive {distance} ({duration})"
                values={{
                  distance: displayDistance(
                    parseInt(o.distance, 10),
                    this.context.config,
                  ),
                  duration: durationToString(o.duration * 1000),
                }}
              />}
            {o.mode !== 'WALK' &&
              o.mode !== 'BICYCLE' &&
              o.mode !== 'CAR' &&
              <div className="">
                <FormattedMessage
                  id={o.mode.toLowerCase()}
                  defaultMessage="mode"
                />
                <span>
                  {` ${o.route.shortName} - ${o.trip.tripHeadsign}`}
                </span>
              </div>}
            {o.intermediateStops.length > 0 &&
              <div className="intermediate-stops">
                <div className="intermediate-stops-count">
                  <FormattedMessage
                    id="number-of-intermediate-stops"
                    defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
                    values={{
                      number:
                        (o.intermediateStops && o.intermediateStops.length) ||
                        0,
                    }}
                  />
                  <span className="intermediate-stops-duration">
                    {` (${durationToString(o.duration * 1000)})`}
                  </span>
                </div>
                {o.intermediateStops.map(o2 =>
                  <div key={o2.gtfsId} className="intermediate-stop-single">
                    <span className="print-itinerary-stop-shortname">
                      {o2.name}
                    </span>
                    <span className="print-itinerary-stop-code">
                      {` [${o2.code}]`}
                    </span>
                  </div>,
                )}
              </div>}
          </div>
        </div>
      </div>,
    );
    legs.push(
      <div className={`print-itinerary-leg end`}>
        <div className="itinerary-left">
          <div className="itinerary-timestamp">
            {moment(this.state.itineraryObj.endTime).format('HH:mm')}
          </div>
          <div className="itinerary-icon" />
        </div>
        <div className={`itinerary-circleline end`}>
          <Icon
            img="icon-icon_mapMarker-point"
            className="itinerary-icon to to-it"
          />
        </div>
        <div className="itinerary-center">
          <div className="itinerary-leg-stopname">
            {
              this.props.itinerary.legs[this.props.itinerary.legs.length - 1].to
                .name
            }
          </div>
        </div>
      </div>,
    );

    return (
      <div className="print-itinerary-container">
        <div className="print-itinerary-allLegs">
          {legs}
        </div>
      </div>
    );
  }
}

PrintableItinerary.propTypes = {
  location: PropTypes.object,
  itinerary: PropTypes.object.isRequired,
};

PrintableItinerary.contextTypes = { config: PropTypes.object.isRequired };

export default Relay.createContainer(PrintableItinerary, {
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
