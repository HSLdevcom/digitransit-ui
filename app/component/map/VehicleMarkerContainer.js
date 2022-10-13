import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import { ExtendedRouteTypes } from '../../constants';
import VehicleIcon from '../VehicleIcon';
import IconMarker from './IconMarker';
import { isBrowser } from '../../util/browser';

const MODES_WITH_ICONS = [
  'bus',
  'bus-express',
  'tram',
  'rail',
  'subway',
  'ferry',
];

function getVehicleIcon(
  mode,
  heading,
  vehicleNumber,
  color,
  useLargeIcon = true,
) {
  if (!isBrowser) {
    return null;
  }
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

function shouldShowVehicle(message, direction, tripStart, pattern, headsign) {
  return (
    !Number.isNaN(parseFloat(message.lat)) &&
    !Number.isNaN(parseFloat(message.long)) &&
    (pattern === undefined ||
      pattern.substr(0, message.route.length) === message.route) &&
    (headsign === undefined ||
      message.headsign === undefined ||
      headsign === message.headsign) &&
    /* delay-prediction service doesn't send the correct direction_id
     (direction === undefined ||
      message.direction === undefined ||
      message.direction === direction) && */
    (tripStart === undefined ||
      message.tripStartTime === undefined ||
      message.tripStartTime === tripStart)
  );
}

function VehicleMarkerContainer(props) {
  const visibleVehicles = Object.entries(props.vehicles).filter(([, message]) =>
    shouldShowVehicle(
      message,
      props.direction,
      props.tripStart,
      props.pattern,
      props.headsign,
    ),
  );
  const visibleVehicleIds = visibleVehicles.map(([id]) => id);
  props.setVisibleVehicles(visibleVehicleIds);

  return visibleVehicles.map(([id, message]) => {
    const type = props.topics?.find(t => t.shortName === message.shortName)
      ?.type;
    const mode =
      type === ExtendedRouteTypes.BusExpress ? 'bus-express' : message.mode;
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
          message.shortName ? message.shortName : message.route.split(':')[1],
          message.color,
          props.useLargeIcon,
        )}
      />
    );
  });
}

VehicleMarkerContainer.propTypes = {
  tripStart: PropTypes.string,
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
};

VehicleMarkerContainer.defaultProps = {
  tripStart: undefined,
  direction: undefined,
};

const connectedComponent = connectToStores(
  VehicleMarkerContainer,
  ['RealTimeInformationStore'],
  (context, props) => {
    const { vehicles, setVisibleVehicles } = context.getStore(
      'RealTimeInformationStore',
    );
    let vehiclesFiltered = vehicles;
    if (props.mode) {
      const filtered = Object.entries(vehicles).filter(
        ([, message]) =>
          message.mode.toLowerCase() === props.mode.toLowerCase(),
      );
      vehiclesFiltered = Object.fromEntries(filtered);
    }
    // if you keep the UI open for a long time then trips that have finsished accumulated on the screen
    // this removes anything that hasn't had an update in 3 minutes
    const vehiclesWithRecentUpdates = Object.entries(vehiclesFiltered).filter(
      ([, message]) => {
        const threeMinutesAgo = moment().subtract(180, 'seconds');
        return moment.unix(message.timestamp).isAfter(threeMinutesAgo);
      },
    );
    return {
      ...props,
      vehicles: Object.fromEntries(vehiclesWithRecentUpdates),
      setVisibleVehicles,
    };
  },
);

export {
  connectedComponent as default,
  VehicleMarkerContainer as Component,
  shouldShowVehicle,
  getVehicleIcon,
};
