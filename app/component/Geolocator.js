/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEqual from 'lodash/isEqual';
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
    const { from, to } = props.match.params;

    const redirect = () => {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newFrom = from === undefined ? locationForUrl : from;
      let newTo;
      if (to === 'POS' || (from !== undefined && to === undefined)) {
        newTo = locationForUrl;
      } else {
        newTo = to === undefined ? '-' : to;
      }
      const returnPath = createReturnPath(path, newFrom, newTo);

      const newLocation = {
        ...props.match.location,
        pathname: returnPath,
      };
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
