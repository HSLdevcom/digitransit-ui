/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEqual from 'lodash/isEqual';
import { startLocationWatch } from '../action/PositionActions';
import Loading from './Loading';
import { isBrowser } from '../util/browser';
import { getFrontPath, getRoutePath } from '../util/path';
import { addressToItinerarySearch } from '../util/otpStrings';

const Geolocator = () => <Loading />;

const GeolocatorWithPosition = connectToStores(
  Geolocator,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();
    const { pathname } = props.match.location;
    const frontPage = pathname.includes('etusivu');
    const { from, to } = props.match.params;

    const redirect = () => {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newFrom = from === undefined ? locationForUrl : from;
      let newTo;
      if (locationForUrl && isEqual(locationForUrl, newFrom)) {
        newTo = to === undefined || to === 'POS' ? '-' : to;
      } else {
        newTo = to === undefined || to === 'POS' ? locationForUrl : to;
      }

      const newLocation = {
        ...props.match.location,
        pathname: frontPage
          ? getFrontPath(newFrom, newTo, context.config.indexPath)
          : getRoutePath(newFrom, newTo),
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
  config: PropTypes.object.isRequired,
};

export default GeolocatorWithPosition;
