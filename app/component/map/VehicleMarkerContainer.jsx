import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useRealTimeInformation } from '../../hooks/RealTimeInformationContext';
import { ExtendedRouteTypes } from '../../../utils/shared/constants';
import VehicleIcon from '../VehicleIcon';
import IconMarker from './IconMarker';
import { splitGtfsId } from '../../../utils/shared/gtfs';
import { useConfigContext } from '../../client/ConfigContext';

const MODES_WITH_ICONS = [
  'bus',
  'bus-express',
  'tram',
  'rail',
  'subway',
  'ferry',
  'speedtram',
  'replacement-bus',
];

function getVehicleIcon(mode, heading, vehicleNumber, color, useLargeIcon) {
  const modeOrDefault = MODES_WITH_ICONS.indexOf(mode) !== -1 ? mode : 'bus';

  return {
    element: (
      <VehicleIcon
        rotate={heading}
        mode={modeOrDefault}
        vehicleNumber={vehicleNumber}
        useLargeIcon={useLargeIcon}
        color={color}
      />
    ),
    className: `vehicle-icon ${modeOrDefault}`,
    iconSize: [20, 20],
    iconAnchor: useLargeIcon ? [15, 15] : [10, 10],
  };
}

// if tripStartTime has been specified,
// use only the updates for vehicles with matching startTime

function shouldShowVehicle(
  message,
  direction,
  tripStart,
  pattern,
  headsign,
  trip,
) {
  const { entityId: tripId } = splitGtfsId(message.tripId);
  return (
    !Number.isNaN(parseFloat(message.lat)) &&
    !Number.isNaN(parseFloat(message.long)) &&
    (pattern === undefined ||
      pattern.substr(0, message.route.length) === message.route) &&
    (headsign === undefined ||
      message.headsign === undefined ||
      headsign === message.headsign) &&
    (direction === undefined ||
      direction === -1 ||
      message.direction === undefined ||
      message.direction === direction) &&
    (tripStart === undefined ||
      message.tripStartTime === undefined ||
      message.tripStartTime === tripStart) &&
    (trip === undefined || tripId === undefined || tripId === trip)
  );
}

function VehicleMarkerContainer({
  direction,
  headsign,
  pattern,
  setVisibleVehicles,
  topics,
  useLargeIcon = true,
  vehicles,
}) {
  const config = useConfigContext();
  const visibleVehicles = Object.entries(vehicles).filter(([, message]) => {
    const { feedId, entityId: routeId } = splitGtfsId(message.route);
    const { ignoreHeadsign } = config.realTime[feedId];
    const desc = routeId ? topics?.find(t => t.route === routeId) : undefined;
    return shouldShowVehicle(
      message,
      direction || desc?.direction,
      desc?.tripStart,
      pattern,
      ignoreHeadsign ? undefined : headsign,
      desc?.tripId,
    );
  });
  const visibleVehicleIds = visibleVehicles.map(([id]) => id);
  useEffect(() => {
    setVisibleVehicles(visibleVehicleIds);
  }, [vehicles, direction, headsign, pattern, topics, setVisibleVehicles]);

  return visibleVehicles.map(([id, message]) => {
    const { entityId: routeId } = splitGtfsId(message.route);
    const type = topics?.find(
      t => t.shortName === message.shortName || t.route === routeId,
    )?.type;
    let mode;
    if (type === ExtendedRouteTypes.BusExpress) {
      mode = 'bus-express';
    } else if (type === ExtendedRouteTypes.SpeedTram) {
      mode = 'speedtram';
    } else if (
      type === ExtendedRouteTypes.ReplacementBus ||
      config.replacementBusRoutes?.includes(message.route)
    ) {
      mode = 'replacement-bus';
    } else {
      mode = message.mode;
    }
    const { feedId } = splitGtfsId(message.route);
    let vehicleNumber = message.shortName
      ? config.realTime[feedId].vehicleNumberParser(message.shortName)
      : routeId;
    // Fallback to a question mark if the vehicle number is too long to fit in the icon
    vehicleNumber = vehicleNumber.length > 5 ? '?' : vehicleNumber;
    return (
      <IconMarker
        key={id}
        position={{
          lat: message.lat,
          lon: message.long,
        }}
        zIndexOffset={10000}
        icon={getVehicleIcon(
          mode,
          message.heading,
          vehicleNumber,
          message.color,
          useLargeIcon,
        )}
      />
    );
  });
}

VehicleMarkerContainer.propTypes = {
  headsign: PropTypes.string,
  direction: PropTypes.number,
  vehicles: PropTypes.objectOf(
    PropTypes.shape({
      direction: PropTypes.number,
      tripStartTime: PropTypes.string,
      mode: PropTypes.string.isRequired,
      shortName: PropTypes.string,
      heading: PropTypes.number,
      lat: PropTypes.number.isRequired,
      long: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  useLargeIcon: PropTypes.bool,
  mode: PropTypes.string,
};

function ConnectedVehicleMarkerContainer(props) {
  const { vehicles, actions } = useRealTimeInformation();
  let vehiclesFiltered = vehicles;
  if (props.mode) {
    const filtered = Object.entries(vehicles).filter(
      ([, message]) => message.mode.toLowerCase() === props.mode.toLowerCase(),
    );
    vehiclesFiltered = Object.fromEntries(filtered);
  }
  // if you keep the UI open for a long time then trips that have finsished accumulated on the screen
  // this removes anything that hasn't had an update in 3 minutes
  const vehiclesWithRecentUpdates = Object.entries(vehiclesFiltered).filter(
    ([, message]) => {
      return message.receivedAt > Date.now() / 1000 - 180;
    },
  );
  return (
    <VehicleMarkerContainer
      {...props}
      vehicles={Object.fromEntries(vehiclesWithRecentUpdates)}
      setVisibleVehicles={actions.setVisibleVehicles}
    />
  );
}

ConnectedVehicleMarkerContainer.propTypes = {
  mode: PropTypes.string,
};

export {
  ConnectedVehicleMarkerContainer as default,
  VehicleMarkerContainer as Component,
  shouldShowVehicle,
  getVehicleIcon,
};
