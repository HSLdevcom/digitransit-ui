import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Relay from 'react-relay/classic';
import polyline from 'polyline-encoded';

import { FormattedMessage } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import Icon from './Icon';
import RouteNumber from './RouteNumber';
import LegAgencyInfo from './LegAgencyInfo';
import CityBikeMarker from './map/non-tile-layer/CityBikeMarker';
import PrintableItineraryHeader from './/PrintableItineraryHeader';
import { isCallAgencyPickupType } from '../util/legUtils';
import Map from './map/Map';
import ItineraryLine from './map/ItineraryLine';
import RouteLine from './map/route/RouteLine';
import LocationMarker from '../component/map/LocationMarker';

const getHeadSignFormat = sentLegObj => {
  const stopcode = sentLegObj.from.stop !== null && (
    <span className="stop-code">
      {sentLegObj.from.stop.code ? `[${sentLegObj.from.stop.code}]` : ``}
    </span>
  );
  let headSignFormat;

  if (sentLegObj.rentedBike === true) {
    headSignFormat = (
      <FormattedMessage
        id="rent-cycle-at"
        values={{ station: sentLegObj.from.name }}
      />
    );
  } else if (sentLegObj.isCheckin) {
    headSignFormat = (
      <FormattedMessage
        id="airport-check-in"
        values={{ agency: sentLegObj.agency }}
      />
    );
  } else if (sentLegObj.isLuggage) {
    headSignFormat = (
      <FormattedMessage
        id="airport-collect-luggage"
        defaultMessage="airport-collect-luggage"
      />
    );
  } else {
    headSignFormat = `${sentLegObj.from.name} `;
  }

  return (
    <div className="itinerary-leg-stopname">
      {headSignFormat}
      {stopcode}
    </div>
  );
};

const getHeadSignDetails = sentLegObj => {
  let headSignDetails;
  let transitMode;

  if (sentLegObj.isCheckin) {
    headSignDetails = (
      <FormattedMessage
        id="airport-security-check-go-to-gate"
        defaultMessage="Proceed to your gate through security check"
      />
    );
  } else if (sentLegObj.isLuggage) {
    headSignDetails = '';
  } else {
    headSignDetails = ` ${sentLegObj.route.shortName && sentLegObj
      ? sentLegObj.route.shortName
      : sentLegObj.route.longName} - ${sentLegObj.trip.tripHeadsign}`;
    transitMode = (
      <FormattedMessage
        id={sentLegObj.mode.toLowerCase()}
        defaultMessage="mode"
      />
    );
  }

  return (
    <div>
      <span>{transitMode}</span>
      <span>{headSignDetails}</span>
    </div>
  );
};

const getItineraryStops = sentLegObj => (
  <div className="intermediate-stops">
    <div className="intermediate-stops-count">
      <FormattedMessage
        id="number-of-intermediate-stops"
        defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
        values={{
          number:
            (sentLegObj.intermediateStops &&
              sentLegObj.intermediateStops.length) ||
            0,
        }}
      />
      <span className="intermediate-stops-duration">
        {` (${durationToString(sentLegObj.duration * 1000)})`}
      </span>
    </div>
    {sentLegObj.intermediateStops.map(o2 => (
      <div key={o2.gtfsId} className="intermediate-stop-single">
        <span className="print-itinerary-stop-shortname">{o2.name}</span>
        <span className="print-itinerary-stop-code">
          {o2.code !== null ? ` [${o2.code}]` : ``}
        </span>
      </div>
    ))}
  </div>
);

function TransferMap(props) {
  const bounds = [].concat(polyline.decode(props.legObj.legGeometry.points));
  const nextLeg = props.originalLegs[props.index + 1];
  const previousLeg = props.originalLegs[props.index - 1];

  let itineraryLine;
  if (!nextLeg) {
    itineraryLine = [previousLeg, props.legObj];
  } else if (nextLeg && nextLeg.intermediatePlace) {
    itineraryLine = [props.legObj];
  } else {
    itineraryLine = [props.legObj, nextLeg];
  }

  const leafletObjs = [
    <ItineraryLine
      key={'line'}
      legs={itineraryLine}
      showTransferLabitineraryels
      showIntermediateStops
    />,
  ];
  if (props.index === 0) {
    leafletObjs.push(
      <LocationMarker
        key="fromMarker"
        position={props.legObj.from}
        className="from"
      />,
    );
  }

  if (!nextLeg) {
    leafletObjs.push(
      <LocationMarker
        key="toMarker"
        position={props.legObj.to}
        className="to"
      />,
    );
  }

  if (nextLeg) {
    if (nextLeg.intermediatePlace === true) {
      leafletObjs.push(
        <LocationMarker
          key={'via'}
          position={props.legObj.to}
          className="via"
        />,
      );
    }
  }

  if (props.legObj.intermediatePlace === true) {
    leafletObjs.push(
      <LocationMarker
        key={'via'}
        position={props.legObj.from}
        className="via"
      />,
    );
  }
  return (
    <div className="transfermap-container">
      <Map
        bounds={bounds}
        leafletObjs={leafletObjs}
        className="print-itinerary-map"
        fitBounds={bounds}
        zoom={17}
        showScaleBar={false}
        showStops
        loaded={() => props.mapsLoaded()}
        disableZoom
        animate={false}
      />
    </div>
  );
}

TransferMap.propTypes = {
  originalLegs: PropTypes.object.isRequired,
  legObj: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  mapsLoaded: PropTypes.func,
};

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
          {props.index === 0 ? (
            <Icon
              img="icon-icon_mapMarker-point"
              className="itinerary-icon from from-it"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={32}
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
              <circle strokeWidth="6" width={28} cx={16} cy={20} r={11} />
            </svg>
          )}
        </div>
        <div className={`leg-before-line ${props.legObj.mode.toLowerCase()}`} />
      </div>
      <div className={`itinerary-center ${props.legObj.mode.toLowerCase()}`}>
        <div className="itinerary-center-left">
          {getHeadSignFormat(props.legObj)}
          <div className="itinerary-instruction">
            {props.legObj.mode === 'WALK' && (
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
              />
            )}
            {props.legObj.mode === 'BICYCLE' && (
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
              />
            )}
            {props.legObj.mode === 'citybike' && (
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
              />
            )}
            {props.legObj.mode === 'CAR' && (
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
              />
            )}
            {props.legObj.mode !== 'WALK' &&
              props.legObj.mode !== 'BICYCLE' &&
              props.legObj.mode !== 'CAR' &&
              props.legObj.mode !== 'citybike' &&
              getHeadSignDetails(props.legObj)}
            {props.legObj.intermediateStops.length > 0 &&
              getItineraryStops(props.legObj)}
          </div>
        </div>
        <div
          className={`itinerary-center-right ${props.legObj.mode.toLowerCase()}`}
        >
          {props.legObj.mode === 'WALK' && (
            <TransferMap
              originalLegs={props.originalLegs}
              index={props.index}
              legObj={props.legObj}
              mapsLoaded={() => props.mapsLoaded()}
            />
          )}
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
  mapsLoaded: PropTypes.function,
};

class PrintableItinerary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraryObj: this.props.itinerary,
      mapsLoaded: 0,
    };
  }

  render() {
    const originalLegs = this.props.itinerary.legs.filter(o => o.distance > 0);
    const legs = originalLegs.map((o, i) => {
      if (o.mode !== 'AIRPLANE') {
        const cloneObj = Object.assign({}, o);
        let specialMode;
        if (isCallAgencyPickupType(o)) {
          specialMode = 'call';
        } else if (o.rentedBike === true) {
          specialMode = 'citybike';
        } else {
          specialMode = false;
        }
        cloneObj.mode = specialMode === false ? cloneObj.mode : specialMode;
        return (
          <div
            key={o.client}
            className={`print-itinerary-leg
                ${o.mode.toLowerCase()}
                `}
          >
            <PrintableLeg
              legObj={cloneObj}
              index={i}
              originalLegs={originalLegs}
              context={this.context}
              mapsLoaded={() => {
                this.setState({ mapsLoaded: this.state.mapsLoaded + 1 });
                if (
                  this.state.mapsLoaded + 1 ===
                  originalLegs.filter(o2 => o2.mode === 'WALK').length
                ) {
                  setTimeout(() => window.print(), 1000);
                }
              }}
            />
          </div>
        );
      }
      const checkin = Object.assign({}, o);
      checkin.mode = 'WAIT';
      checkin.startTime = originalLegs[i - 1].endTime;
      checkin.from.name = originalLegs[i - 1].from.name;
      checkin.isCheckin = true;
      const luggage = Object.assign({}, o);
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
        <div className="print-itinerary-leg-container">
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
                this.props.itinerary.legs[this.props.itinerary.legs.length - 1]
                  .to.name
              }
            </div>
          </div>
        </div>
      </div>,
    );
    return (
      <div className="print-itinerary-container">
        <PrintableItineraryHeader itinerary={this.props.itinerary} />
        <div className="print-itinerary-allLegs">{legs}</div>
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
              directionId
              geometry {
                lat
                lon
              }
              stops {
                lat
                lon
                name
                gtfsId
                }
              ${RouteLine.getFragment('pattern')}
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
