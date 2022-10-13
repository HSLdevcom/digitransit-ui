import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { startLocationWatch } from '../action/PositionActions';
import Loading from './Loading';
import { isBrowser } from '../util/browser';
import { addressToItinerarySearch } from '../util/otpStrings';

const Geolocator = () => <Loading />;

const GeolocatorWithPosition = connectToStores(
  Geolocator,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();
    const { createReturnPath, path } = props;
    const { from, to, hash } = props.match.params;

    const redirect = () => {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newFrom = from === undefined ? locationForUrl : from;
      let { save } = props.match.location.query;
      let newTo;
      if (to === 'POS' || (from !== undefined && to === undefined)) {
        newTo = locationForUrl;
        if (save) {
          if (from === undefined) {
            // both are POS, save nothing
            save = '0';
          } else {
            save = '2'; // save origin only
          }
        }
      } else {
        newTo = to === undefined ? '-' : to;
        if (save) {
          save = '3'; // save destination only
        }
      }
      const returnPath = createReturnPath(path, newFrom, newTo, hash);

      const newLocation = {
        ...props.match.location,
        pathname: returnPath,
      };
      if (save) {
        newLocation.query.save = save;
      }
      props.router.replace(newLocation);
    };

    if (isBrowser) {
      if (locationState.locationingFailed) {
        redirect();
      }
      if (locationState.hasLocation === false) {
        if (
          !locationState.isLocationingInProgress &&
          locationState.status === 'no-location'
        ) {
          context.executeAction(startLocationWatch);
        }
      } else if (
        locationState.hasLocation &&
        !locationState.isReverseGeocodingInProgress
      ) {
        redirect();
      }
    }
    return {};
  },
);

GeolocatorWithPosition.contextTypes = {
  ...GeolocatorWithPosition.contextTypes,
  executeAction: PropTypes.func.isRequired,
};
GeolocatorWithPosition.propTypes = {
  path: PropTypes.string.isRequired,
  createReturnPath: PropTypes.func.isRequired,
};

export default GeolocatorWithPosition;
