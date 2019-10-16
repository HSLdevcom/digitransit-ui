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
import PrintableItineraryHeader from './PrintableItineraryHeader';
import {
  compressLegs,
  getLegMode,
  isCallAgencyPickupType,
} from '../util/legUtils';
import MapContainer from './map/MapContainer';
import ItineraryLine from './map/ItineraryLine';
import RouteLine from './map/route/RouteLine';
import LocationMarker from './map/LocationMarker';

const getHeadSignFormat = (sentLegObj, isReturningRentedBike = false) => {
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
  } else if (isReturningRentedBike) {
    headSignFormat = (
      <FormattedMessage
        id="return-cycle-to"
        values={{ station: sentLegObj.from.name }}
        defaultMessage="Return the bike to {station} station"
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
  if (sentLegObj.rentedBike) {
    return null;
  }

  let headSignDetails = '';
  let transitMode = '';

  if (sentLegObj.isCheckin) {
    headSignDetails = (
      <FormattedMessage
        id="airport-security-check-go-to-gate"
        defaultMessage="Proceed to your gate through security check"
      />
    );
  } else if (sentLegObj.isLuggage) {
    headSignDetails = '';
  } else if (sentLegObj.route && sentLegObj.trip) {
    headSignDetails = ` ${
      sentLegObj.route.shortName && sentLegObj
        ? sentLegObj.route.shortName
        : sentLegObj.route.longName
    } - ${sentLegObj.trip.tripHeadsign}`;
    transitMode = (
      <FormattedMessage
        id={sentLegObj.mode.toLowerCase()}
        defaultMessage="mode"
      />
    );
  }

  return (
    <div key="headsign">
      <span>{transitMode}</span>
      <span>{headSignDetails}</span>
    </div>
  );
};

const getItineraryStops = sentLegObj => (
  <div key="intermediate-stops" className="intermediate-stops">
    <div className="intermediate-stops-count">
      <FormattedMessage
        id="number-of-intermediate-stops"
        defaultMessage="{number, plural, =0 {No stops} one {1 stop} other {{number} stops} }"
        values={{
          number:
            (sentLegObj.intermediatePlaces &&
              sentLegObj.intermediatePlaces.length) ||
            0,
        }}
      />
      <span className="intermediate-stops-duration">
        {` (${durationToString(sentLegObj.duration * 1000)})`}
      </span>
    </div>
    {sentLegObj.intermediatePlaces.map(({ stop }) => (
      <div key={stop.gtfsId} className="intermediate-stop-single">
        <span className="print-itinerary-stop-shortname">{stop.name}</span>
        <span className="print-itinerary-stop-code">
          {stop.code !== null ? ` [${stop.code}]` : ``}
        </span>
      </div>
    ))}
  </div>
);

export function TransferMap(props) {
  const { index, legObj, originalLegs } = props;
  const bounds = [].concat(polyline.decode(legObj.legGeometry.points));
  const nextLeg = originalLegs[index + 1];
  const previousLeg = originalLegs[index - 1];

  let itineraryLine;
  if (
    ((!previousLeg && !nextLeg) || (nextLeg && nextLeg.intermediatePlace)) &&
    originalLegs.length > 1
  ) {
    itineraryLine = [legObj];
  } else if (originalLegs.length > 1 && !nextLeg) {
    itineraryLine = [previousLeg, legObj];
  } else if (originalLegs.length === 1) {
    itineraryLine = [legObj];
  } else {
    itineraryLine = [legObj, nextLeg];
  }

  const leafletObjs = [
    <ItineraryLine
      key="line"
      legs={itineraryLine}
      showTransferLabitineraryels
      showIntermediateStops
    />,
  ];
  if (index === 0) {
    leafletObjs.push(
      <LocationMarker key="fromMarker" position={legObj.from} type="from" />,
    );
  }

  if (!nextLeg) {
    leafletObjs.push(
      <LocationMarker key="toMarker" isLarge position={legObj.to} type="to" />,
    );
  }

  if (nextLeg && nextLeg.intermediatePlace === true) {
    leafletObjs.push(<LocationMarker key="via" position={legObj.to} />);
  }

  if (legObj.intermediatePlace === true) {
    leafletObjs.push(<LocationMarker key="via" position={legObj.from} />);
  }

  return (
    <div className="transfermap-container">
      <MapContainer
        bounds={bounds}
        leafletObjs={leafletObjs}
        className="print-itinerary-map"
        fitBounds
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
  originalLegs: PropTypes.array.isRequired,
  legObj: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  mapsLoaded: PropTypes.func,
};

const isWalking = legOrMode =>
  ['WALK', 'BICYCLE_WALK'].find(mode => mode === getLegMode(legOrMode));

export function PrintableLeg(props) {
  const { index, legObj, originalLegs } = props;

  const legMode = getLegMode(legObj) || '';
  const isVehicle =
    legMode !== 'WALK' &&
    legMode !== 'CITYBIKE' &&
    legMode !== 'BICYCLE' &&
    legMode !== 'BICYCLE_WALK' &&
    legMode !== 'CAR';

  // Set up details for a vehicle route
  const vehicleItinerary = o => {
    const arr = [];
    arr.push(getHeadSignDetails(o));
    if (o.intermediatePlaces.length > 0) {
      arr.push(getItineraryStops(o));
    }
    return arr;
  };

  const messagePrefix =
    legMode === 'BICYCLE_WALK' ? 'cyclewalk' : legMode.toLowerCase();

  // Check if the leg is a vehicle leg or not
  const itineraryDescription = isVehicle ? (
    vehicleItinerary(legObj)
  ) : (
    <FormattedMessage
      id={`${messagePrefix}-distance-duration`}
      defaultMessage="Travel {distance} ({duration})"
      values={{
        distance: displayDistance(
          parseInt(legObj.distance, 10),
          props.context.config,
        ),
        duration: durationToString(legObj.duration * 1000),
      }}
    />
  );

  const previousLeg = originalLegs[index - 1];

  return (
    <div className="print-itinerary-leg-container">
      <div className="itinerary-left">
        <div className="itinerary-timestamp">
          {moment(legObj.startTime).format('HH:mm')}
        </div>
        <div className="itinerary-icon">
          <div className={`special-icon ${legObj.mode.toLowerCase()}`}>
            <RouteNumber
              mode={legObj.mode.toLowerCase()}
              vertical
              text={legObj.route !== null ? legObj.route.shortName : null}
            />
          </div>
        </div>
      </div>
      <div className={`itinerary-circleline ${legObj.mode.toLowerCase()}`}>
        <div className="line-circle">
          {index === 0 ? (
            <Icon
              img="icon-icon_mapMarker-from"
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
        <div className={`leg-before-line ${legObj.mode.toLowerCase()}`} />
      </div>
      <div className={`itinerary-center ${legObj.mode.toLowerCase()}`}>
        <div className="itinerary-center-left">
          {getHeadSignFormat(legObj, previousLeg && previousLeg.rentedBike)}
          <div className="itinerary-instruction">{itineraryDescription}</div>
        </div>
        <div className={`itinerary-center-right ${legObj.mode.toLowerCase()}`}>
          {(isWalking(legMode) || // For vehicle leg maps
            (originalLegs.length === 1 && !isVehicle)) && ( // If there's only one leg during walking/cycling/car mode
            <TransferMap
              originalLegs={originalLegs}
              index={index}
              legObj={legObj}
              mapsLoaded={() => props.mapsLoaded()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

PrintableLeg.propTypes = {
  legObj: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  context: PropTypes.object.isRequired,
  originalLegs: PropTypes.array.isRequired,
  mapsLoaded: PropTypes.func,
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
    const { itinerary } = this.props;
    const originalLegs = itinerary.legs;
    const compressedLegs = compressLegs(originalLegs);
    const legs = compressedLegs.map((o, i) => {
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
            key={o.startTime}
            className={`print-itinerary-leg ${o.mode.toLowerCase()}`}
          >
            <PrintableLeg
              legObj={cloneObj}
              index={i}
              originalLegs={originalLegs}
              context={this.context}
              mapsLoaded={() =>
                this.setState(
                  prevState => ({ mapsLoaded: prevState.mapsLoaded + 1 }),
                  () => {
                    if (
                      this.state.mapsLoaded >=
                      compressedLegs.filter(o2 => isWalking(o2)).length
                    ) {
                      setTimeout(() => window.print(), 1000);
                    }
                  },
                )
              }
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
          key={o.startTime}
          className={`print-itinerary-leg ${o.mode.toLowerCase()}`}
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
      <div key="end" className="print-itinerary-leg end">
        <div className="print-itinerary-leg-container">
          <div className="itinerary-left">
            <div className="itinerary-timestamp">
              {moment(this.state.itineraryObj.endTime).format('HH:mm')}
            </div>
            <div className="itinerary-icon" />
          </div>
          <div className="itinerary-circleline end">
            <Icon
              img="icon-icon_mapMarker-to"
              className="itinerary-icon to to-it"
            />
          </div>
          <div className="itinerary-center end">
            <div className="itinerary-leg-stopname">
              {itinerary.legs[itinerary.legs.length - 1].to.name}
            </div>
          </div>
        </div>
      </div>,
    );
    return (
      <div className="print-itinerary-container">
        <PrintableItineraryHeader itinerary={itinerary} />
        <div className="print-itinerary-allLegs">{legs}</div>
      </div>
    );
  }
}

PrintableItinerary.propTypes = {
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
          cents
          components {
            cents
            fareId
            routes {
              agency {
                fareUrl
                gtfsId
                name
              }
              gtfsId
            }
          }
          type
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
              zoneId
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
              zoneId
            }
          }
          legGeometry {
            length
            points
          }
          intermediatePlaces {
            arrivalTime
            stop {
              gtfsId
              lat
              lon
              name
              code
              platformCode
              zoneId
            }
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
              gtfsId
              fareUrl
              name
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
