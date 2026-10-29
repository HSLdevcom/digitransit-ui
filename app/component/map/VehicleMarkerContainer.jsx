import PropTypes from 'prop-types';
import { useEffect } from 'react';
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

export default function VehicleMarkerContainer({
  direction,
  headsign,
  pattern,
  topics,
  useLargeIcon = true,
  mode,
}) {
  const config = useConfigContext();
  const { vehicles, actions } = useRealTimeInformation();
  // if you keep the UI open for a long time then trips that have finsished accumulated on the screen
  // this removes anything that hasn't had an update in 3 minutes
  const vehiclesFiltered = Object.entries(vehicles).filter(([, message]) => {
    const matchesMode =
      !mode || message.mode.toLowerCase() === mode.toLowerCase();
    const isRecent = message.receivedAt > Date.now() / 1000 - 180;
    return matchesMode && isRecent;
  });
  const visibleVehicles = vehiclesFiltered.filter(([, message]) => {
    const { feedId, entityId: routeId } = splitGtfsId(message.route);
    const { ignoreHeadsign } = config.realTime[feedId];
    const routeTopics = topics?.filter(t => t.route === routeId) ?? [];
    // without a matching topic, decide by the message alone
    const candidates = routeTopics.length ? routeTopics : [undefined];
    // the vehicle must belong to one of the selected trips of its route
    return candidates.some(desc =>
      shouldShowVehicle(
        message,
        direction ?? desc?.direction,
        desc?.tripStartTime?.replace(/:/g, ''),
        pattern,
        ignoreHeadsign ? undefined : headsign,
        desc?.tripId,
      ),
    );
  });
  const visibleVehicleIds = visibleVehicles.map(([id]) => id);

  useEffect(() => {
    actions.setVisibleVehicles(visibleVehicleIds);
  }, [vehicles, direction, headsign, pattern, topics, actions, mode]);

  return visibleVehicles.map(([id, message]) => {
    const { entityId: routeId } = splitGtfsId(message.route);
    const type = topics?.find(
      t => t.shortName === message.shortName || t.route === routeId,
    )?.type;
    let vehicleMode;
    if (type === ExtendedRouteTypes.BusExpress) {
      vehicleMode = 'bus-express';
    } else if (type === ExtendedRouteTypes.SpeedTram) {
      vehicleMode = 'speedtram';
    } else if (
      type === ExtendedRouteTypes.ReplacementBus ||
      config.replacementBusRoutes?.includes(message.route)
    ) {
      vehicleMode = 'replacement-bus';
    } else {
      vehicleMode = message.mode;
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
          vehicleMode,
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
  useLargeIcon: PropTypes.bool,
  mode: PropTypes.string,
};

export { shouldShowVehicle, getVehicleIcon };
