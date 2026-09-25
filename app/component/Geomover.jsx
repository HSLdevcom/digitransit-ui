import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { startLocationWatch } from '../action/PositionActions';
import { coordsDiff } from '../../utils/shared/path';
import {
  useOrigin,
  useDestination,
  useItineraryLocationActions,
} from '../hooks/ItineraryLocationContext';

// Updates the origin or destination if it's currently set to follow the
// current location. Origin/destination now live in ItineraryLocationContext
// (replacing OriginStore/DestinationStore), so what used to run as a side
// effect inside connectToStores' compute-props function now runs as a
// regular effect instead.
function useGeomoverSync({ locationState, executeAction, intl }) {
  const origin = useOrigin();
  const destination = useDestination();
  const { setOrigin, setDestination } = useItineraryLocationActions();

  useEffect(() => {
    let target;
    let setTarget;

    if (origin.type === 'CurrentLocation') {
      target = { ...origin };
      setTarget = setOrigin;
    } else if (destination.type === 'CurrentLocation') {
      target = { ...destination };
      setTarget = setDestination;
    }
    if (!setTarget) {
      return;
    }
    let newAddress;

    if (locationState.locationingFailed) {
      target.type = undefined;
      target.address = undefined;
      setTarget(target);
    } else if (
      target.address !== locationState.address &&
      locationState.address
    ) {
      newAddress = locationState.address;
    }
    if (locationState.hasLocation === false) {
      if (
        !locationState.isLocationingInProgress &&
        locationState.status === 'no-location'
      ) {
        executeAction(startLocationWatch);
      }
    } else if (
      locationState.hasLocation &&
      !locationState.isReverseGeocodingInProgress
    ) {
      if (
        newAddress ||
        coordsDiff(target.lat, locationState.lat) ||
        coordsDiff(target.lon, locationState.lon)
      ) {
        if (newAddress) {
          target.address = newAddress;
        } else {
          // rev geocoding failed
          target.address = intl.formatMessage({
            id: 'own-position',
            defaultMessage: 'Own Location',
          });
        }
        target.lat = locationState.lat;
        target.lon = locationState.lon;
        setTarget(target);
      }
    }
    // setOrigin/setDestination/executeAction/intl are stable for the app's
    // lifetime; only origin/destination/locationState changes should
    // re-trigger this sync.
  }, [origin, destination, locationState]);
}

// This container updates origin and destination if they are set to follow current location
export default function withGeomover(WrappedComponent) {
  const GeomoverConnected = connectToStores(
    ({ intl, locationState, executeAction, ...rest }) => {
      useGeomoverSync({ locationState, executeAction, intl });
      return <WrappedComponent {...rest} />;
    },
    ['PositionStore'],
    (context, { intl }) => ({
      locationState: context.getStore('PositionStore').getLocationState(),
      executeAction: context.executeAction,
      intl,
    }),
  );

  GeomoverConnected.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  return function Geomover(props) {
    const intl = useIntl();
    return <GeomoverConnected {...props} intl={intl} />;
  };
}
