import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';

import RouteMarkerPopup from './route/RouteMarkerPopup';
import FuzzyTripRoute from '../../route/FuzzyTripRoute';
import IconWithTail from '../IconWithTail';
import IconMarker from './IconMarker';
import Loading from '../Loading';

import { isBrowser } from '../../util/browser';

const MODES_WITH_ICONS = ['bus', 'tram', 'rail', 'subway', 'ferry'];

let Popup;

function getVehicleIcon(mode, heading, useSmallIcon = false) {
  if (!isBrowser) {
    return null;
  }

  if (MODES_WITH_ICONS.indexOf(mode) !== -1) {
    return {
      element: <IconWithTail img={`icon-icon_${mode}-live`} rotate={heading} />,
      className: `vehicle-icon ${mode} ${useSmallIcon ? 'small-map-icon' : ''}`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    };
  }

  return {
    element: <iconAsString img="icon-icon_bus-live" rotate={heading} />,
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
    pattern.substr(0, message.route.length) === message.route &&
    (message.headsign === undefined || headsign === message.headsign) &&
    (direction === undefined || message.direction === direction) &&
    (tripStart === undefined || message.tripStartTime === tripStart)
  );
}

function VehicleMarkerContainer(props) {
  return Object.entries(props.vehicles)
    .filter(([, message]) =>
      shouldShowVehicle(
        message,
        props.direction,
        props.tripStart,
        props.pattern,
        props.headsign,
      ),
    )
    .map(([id, message]) => (
      <IconMarker
        key={id}
        position={{
          lat: message.lat,
          lon: message.long,
        }}
        icon={getVehicleIcon(message.mode, message.heading, false)}
      >
        <Popup
          offset={[106, 16]}
          maxWidth={250}
          minWidth={250}
          className="popup"
        >
          <Relay.RootContainer
            Component={RouteMarkerPopup}
            route={
              new FuzzyTripRoute({
                route: message.route,
                direction: message.direction,
                date: message.operatingDay,
                time:
                  message.tripStartTime.substring(0, 2) * 60 * 60 +
                  message.tripStartTime.substring(2, 4) * 60,
              })
            }
            renderLoading={() => (
              <div className="card" style={{ height: '12rem' }}>
                <Loading />
              </div>
            )}
            renderFetched={data => (
              <RouteMarkerPopup {...data} message={message} />
            )}
          />
        </Popup>
      </IconMarker>
    ));
}

VehicleMarkerContainer.propTypes = {
  tripStart: PropTypes.string,
  headsign: PropTypes.string,
  direction: PropTypes.number,
  vehicles: PropTypes.objectOf(
    PropTypes.shape({
      direction: PropTypes.number.isRequired,
      tripStartTime: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
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
  (context, props) => ({
    ...props,
    vehicles: context.getStore('RealTimeInformationStore').vehicles,
  }),
);

export {
  connectedComponent as default,
  VehicleMarkerContainer as Component,
  shouldShowVehicle,
};
