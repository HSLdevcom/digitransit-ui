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

function PrintableLeg(props) {
  return (
    <div className="print-itinerary-leg-container">
      <div className="itinerary-left">
        <div className="itinerary-timestamp">
          {moment(props.legObj.startTime).format('HH:mm')}
        </div>
        <div className="itinerary-icon">
          <div className={`special-icon ${props.legObj.mode.toLowerCase()}`}>
            <RouteNumber
              mode={props.legObj.mode.toLowerCase()}
              vertical={`${true}`}
              text={
                props.legObj.route !== null
                  ? props.legObj.route.shortName
                  : null
              }
            />
          </div>
        </div>
      </div>
      <div
        className={`itinerary-circleline ${props.legObj.mode.toLowerCase()}`}
      >
        <div className="line-circle">
          {props.index === 0
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
        <div className={`leg-before-line ${props.legObj.mode.toLowerCase()}`} />
      </div>
      <div className="itinerary-center">
        <div className="itinerary-leg-stopname">
          {props.legObj.rentedBike !== true
            ? `${props.legObj.from.name} `
            : <FormattedMessage
                id="rent-cycle-at"
                values={{ station: props.legObj.from.name }}
              />}
          {props.legObj.from.stop !== null &&
            <span className="stop-code">
              {props.legObj.from.stop.code
                ? `[${props.legObj.from.stop.code}]`
                : ``}
            </span>}
        </div>
        <div className="itinerary-instruction">
          {props.legObj.mode === 'WALK' &&
            <FormattedMessage
              id="walk-distance-duration"
              defaultMessage="Walk {distance} ({duration})"
              values={{
                distance: displayDistance(
                  parseInt(props.legObj.distance, 10),
                  props.context.config,
                ),
                duration: durationToString(props.legObj.duration * 1000),
              }}
            />}
          {props.legObj.mode === 'BICYCLE' &&
            props.legObj.rentedBike === false &&
            <FormattedMessage
              id="cycle-distance-duration"
              defaultMessage="Cycle {distance} ({duration})"
              values={{
                distance: displayDistance(
                  parseInt(props.legObj.distance, 10),
                  props.context.config,
                ),
                duration: durationToString(props.legObj.duration * 1000),
              }}
            />}
          {props.legObj.mode === 'BICYCLE' &&
            props.legObj.rentedBike === true &&
            <FormattedMessage
              id="cycle-distance-duration"
              defaultMessage="Cycle {distance} ({duration})"
              values={{
                distance: displayDistance(
                  parseInt(props.legObj.distance, 10),
                  props.context.config,
                ),
                duration: durationToString(props.legObj.duration * 1000),
              }}
            />}
          {props.legObj.mode === 'CAR' &&
            <FormattedMessage
              id="car-distance-duration"
              defaultMessage="Drive {distance} ({duration})"
              values={{
                distance: displayDistance(
                  parseInt(props.legObj.distance, 10),
                  props.context.config,
                ),
                duration: durationToString(props.legObj.duration * 1000),
              }}
            />}
          {props.legObj.mode !== 'WALK' &&
            props.legObj.mode !== 'BICYCLE' &&
            props.legObj.mode !== 'CAR' &&
            <div className="">
              <FormattedMessage
                id={props.legObj.mode.toLowerCase()}
                defaultMessage="mode"
              />
              <span>
                {` ${props.legObj.route.shortName
                  ? props.legObj.route.shortName
                  : props.legObj.route.longName} - ${props.legObj.trip
                  .tripHeadsign}`}
                {props.legObj.isCheckin && `Tee lähtöselvitys`}
              </span>
            </div>}
          {props.legObj.intermediateStops.length > 0 &&
            <div className="intermediate-stops">
              <div className="intermediate-stops-count">
                <FormattedMessage
                  id="number-of-intermediate-stops"
                  defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
                  values={{
                    number:
                      (props.legObj.intermediateStops &&
                        props.legObj.intermediateStops.length) ||
                      0,
                  }}
                />
                <span className="intermediate-stops-duration">
                  {` (${durationToString(props.legObj.duration * 1000)})`}
                </span>
              </div>
              {props.legObj.intermediateStops.map(o2 =>
                <div key={o2.gtfsId} className="intermediate-stop-single">
                  <span className="print-itinerary-stop-shortname">
                    {o2.name}
                  </span>
                  <span className="print-itinerary-stop-code">
                    {o2.code !== null ? ` [${o2.code}]` : ``}
                  </span>
                </div>,
              )}
            </div>}
        </div>
      </div>
    </div>
  );
}

PrintableLeg.propTypes = {
  location: PropTypes.object,
  itinerary: PropTypes.object.isRequired,
  legObj: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  context: PropTypes.object.isRequired,
  originalLegs: PropTypes.array.isRequired,
  endTime: PropTypes.number.isRequired,
};

class PrintableItinerary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraryObj: this.props.itinerary,
    };
  }

  render() {
    console.log(this.props.itinerary);
    // return null;
    // const fare = this.state.itineraryObj.fares ? this.state.itineraryObj.fares[0].components[0].fareId : 0;
    // const waitThreshold = this.context.config.itinerary.waitThreshold * 1000;
    const originalLegs = this.props.itinerary.legs.filter(o => o.distance > 0);
    const legs = originalLegs.map((o, i) => {
      if (o.mode !== 'AIRPLANE') {
        return (
          <div
            key={o.client}
            className={`print-itinerary-leg
                ${o.mode.toLowerCase()}
                `}
          >
            <PrintableLeg
              legObj={o}
              index={i}
              originalLegs={originalLegs}
              context={this.context}
            />
          </div>
        );
      }
      const checkin = Object.assign({}, o);
      checkin.mode = 'WAIT';
      checkin.startTime = originalLegs[i - 1].endTime;
      checkin.from.name = originalLegs[i - 1].from.name;
      checkin.isCheckin = true;
      const luggage = Object.assignx({}, o);
      luggage.mode = 'WAIT';
      luggage.startTime = o.endTime;
      luggage.isLuggage = true;
      return (
        <div
          key={o.client}
          className={`print-itinerary-leg
        ${o.mode.toLowerCase()}
        `}
        >
          <PrintableLeg
            legObj={checkin}
            index={i}
            originalLegs={originalLegs}
            context={this.context}
          />
          <PrintableLeg
            legObj={o}
            index={i}
            originalLegs={originalLegs}
            context={this.context}
          />
          <PrintableLeg
            legObj={luggage}
            index={i}
            originalLegs={originalLegs}
            context={this.context}
          />
        </div>
      );
    });
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
        <div className="itinerary-center end">
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
