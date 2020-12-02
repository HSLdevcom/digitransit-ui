import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import TripMarkerPopup from './route/TripMarkerPopup';
import IconWithTail from '../IconWithTail';
import IconMarker from './IconMarker';
import Loading from '../Loading';

import { isBrowser } from '../../util/browser';

const MODES_WITH_ICONS = ['bus', 'tram', 'rail', 'subway', 'ferry'];

let Popup;

function getVehicleIcon(
  mode,
  heading,
  vehicleNumber,
  useSmallIcon = false,
  useLargeIcon = false,
) {
  if (!isBrowser) {
    return null;
  }
  if (!mode) {
    return useLargeIcon
      ? {
          element: (
            <IconWithTail
              img="icon-icon_all-vehicles-large"
              rotate={heading}
              allVehicles
              vehicleNumber={vehicleNumber}
              useLargeIcon={useLargeIcon}
            />
          ),
          className: `vehicle-icon bus ${useSmallIcon ? 'small-map-icon' : ''}`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }
      : {
          element: (
            <IconWithTail
              img="icon-icon_all-vehicles-small"
              rotate={heading}
              allVehicles
            />
          ),
          className: `vehicle-icon bus ${useSmallIcon ? 'small-map-icon' : ''}`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        };
  }
  if (MODES_WITH_ICONS.indexOf(mode) !== -1) {
    return {
      element: (
        <IconWithTail
          img={`icon-icon_${mode}-live`}
          rotate={heading}
          mode={mode}
          vehicleNumber={vehicleNumber}
        />
      ),
      className: `vehicle-icon ${mode} ${useSmallIcon ? 'small-map-icon' : ''}`,
      iconSize: [20, 20],
      iconAnchor: [15, 15],
    };
  }

  return {
    element: <IconWithTail img="icon-icon_bus-live" rotate={heading} />,
    className: `vehicle-icon bus ${useSmallIcon ? 'small-map-icon' : ''}`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

function VehicleMarkerContainer(containerProps) {
  const { environment } = useContext(ReactRelayContext);
  return Object.entries(containerProps.vehicles)
    .filter(([, message]) =>
      shouldShowVehicle(
        message,
        containerProps.direction,
        containerProps.tripStart,
        containerProps.pattern,
        containerProps.headsign,
      ),
    )
    .map(([id, message]) => (
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
          false,
          containerProps.useLargeIcon,
        )}
      >
        <Popup
          offset={[106, 0]}
          maxWidth={250}
          minWidth={250}
          className="vehicle-popup"
        >
          {message.tripId ? (
            <QueryRenderer
              query={graphql`
                query VehicleMarkerContainerQuery(
                  $route: String!
                  $id: String!
                ) {
                  route: route(id: $route) {
                    ...TripMarkerPopup_route
                  }
                  trip: trip(id: $id) {
                    ...TripMarkerPopup_trip
                  }
                }
              `}
              variables={{
                route: message.route,
                id: message.tripId,
              }}
              environment={environment}
              render={({ props }) =>
                props ? (
                  <TripMarkerPopup {...props} message={message} />
                ) : (
                  <div className="card" style={{ height: '12rem' }}>
                    <Loading />
                  </div>
                )
              }
            />
          ) : (
            <QueryRenderer
              query={graphql`
                query VehicleMarkerContainerFuzzyQuery(
                  $route: String!
                  $direction: Int!
                  $time: Int!
                  $date: String!
                ) {
                  route: route(id: $route) {
                    ...TripMarkerPopup_route
                  }
                  trip: fuzzyTrip(
                    route: $route
                    direction: $direction
                    time: $time
                    date: $date
                  ) {
                    ...TripMarkerPopup_trip
                  }
                }
              `}
              variables={{
                route: message.route,
                direction: message.direction,
                date: message.operatingDay,
                time:
                  message.tripStartTime.substring(0, 2) * 60 * 60 +
                  message.tripStartTime.substring(2, 4) * 60,
              }}
              environment={environment}
              // eslint-disable-next-line no-unused-vars
              render={({ props }) =>
                props ? (
                  <TripMarkerPopup {...props} message={message} />
                ) : (
                  <div className="card" style={{ height: '12rem' }}>
                    <Loading />
                  </div>
                )
              }
            />
          )}
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
    const { vehicles } = context.getStore('RealTimeInformationStore');
    return {
      ...props,
      vehicles,
    };
  },
);

export {
  connectedComponent as default,
  VehicleMarkerContainer as Component,
  shouldShowVehicle,
  getVehicleIcon,
};
