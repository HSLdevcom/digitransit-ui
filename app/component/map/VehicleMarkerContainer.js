import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import VehicleIcon from '../VehicleIcon';
import IconMarker from './IconMarker';
import { isBrowser } from '../../util/browser';
import CardHeader from '../CardHeader';
import Icon from '../Icon';

const MODES_WITH_ICONS = ['bus', 'tram', 'rail', 'subway', 'ferry'];

// eslint-disable-next-line no-unused-vars
let Popup;

const iconSuffix = occupancyStatus => {
  switch (occupancyStatus) {
    case 'STANDING_ROOM_ONLY':
      return 'red';
    case 'FEW_SEATS_AVAILABLE':
      return 'orange';
    default:
      return 'green';
  }
};

function getVehicleIcon(
  mode,
  heading,
  vehicleNumber,
  color,
  useLargeIcon = true,
  occupancyStatus,
  useCustomIcon,
) {
  if (!isBrowser) {
    return null;
  }
  const modeOrDefault = MODES_WITH_ICONS.indexOf(mode) !== -1 ? mode : 'bus';
  const icon = `#icon-icon_bus-live-${iconSuffix(occupancyStatus)}`;
  return {
    element: (
      <VehicleIcon
        rotate={heading}
        mode={modeOrDefault}
        vehicleNumber={vehicleNumber}
        useLargeIcon={useLargeIcon}
        color={color}
        customIcon={useCustomIcon ? icon : undefined}
      />
    ),
    className: `vehicle-icon ${modeOrDefault}`,
    iconSize: [20, 20],
    iconAnchor: useLargeIcon ? [15, 15] : [10, 10],
  };
}

if (isBrowser) {
  /* eslint-disable global-require */
  Popup = require('react-leaflet/es/Popup').default;
  /* eslint-enable global-require */
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
    (direction === undefined ||
      message.direction === undefined ||
      message.direction === direction) &&
    (tripStart === undefined ||
      message.tripStartTime === undefined ||
      message.tripStartTime === tripStart)
  );
}

const drawOccupancy = status => {
  let suffix;
  switch (status) {
    case 'STANDING_ROOM_ONLY':
      suffix = 'high';
      break;
    case 'FEW_SEATS_AVAILABLE':
      suffix = 'medium';
      break;
    default:
      suffix = 'low';
      break;
  }
  return (
    // eslint-disable-next-line react/no-array-index-key
    <Icon img={`occupancy-${suffix}`} height={1.2} width={1.2} />
  );
};

function VehicleMarkerContainer(containerProps) {
  const visibleVehicles = Object.entries(
    containerProps.vehicles,
  ).filter(([, message]) =>
    shouldShowVehicle(
      message,
      containerProps.direction,
      containerProps.tripStart,
      containerProps.pattern,
      containerProps.headsign,
    ),
  );
  const visibleVehicleIds = visibleVehicles.map(([id]) => id);
  containerProps.setVisibleVehicles(visibleVehicleIds);

  return visibleVehicles.map(([id, message]) => (
    <IconMarker
      key={id}
      position={{
        lat: message.lat,
        lon: message.long,
      }}
      zIndexOffset={10000}
      icon={getVehicleIcon(
        containerProps.ignoreMode ? null : message.mode,
        message.heading,
        message.shortName ? message.shortName : message.route.split(':')[1],
        message.color,
        containerProps.useLargeIcon,
        message.occupancyStatus,
        true,
      )}
    >
      <Popup
        offset={[106, 0]}
        maxWidth={250}
        minWidth={250}
        className="vehicle-popup"
      >
        <div className="card occupancy-card">
          <div className="padding-normal">
            <CardHeader
              name="Bus"
              description=""
              descClass="padding-vertical-small"
              unlinked
              className="padding-medium"
              icon={`icon-icon_bus-live-${iconSuffix(message.occupancyStatus)}`}
              headingStyle="h2"
            />
            <div className="occupancy-icon">
              {drawOccupancy(message.occupancyStatus)}
            </div>
            <div>
              <FormattedMessage
                id={`occupancy-status-${message.occupancyStatus}`}
                defaultMessage={message.occupancyStatus}
              />
            </div>
          </div>
        </div>
      </Popup>
    </IconMarker>
  ));
}

VehicleMarkerContainer.propTypes = {
  tripStart: PropTypes.string,
  headsign: PropTypes.string,
  direction: PropTypes.number,
  ignoreMode: PropTypes.bool,
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
    return {
      ...props,
      vehicles,
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
