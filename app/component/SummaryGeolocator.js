/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import {
  initGeolocation,
  checkPositioningPermission,
} from '../action/PositionActions';
import Loading from './Loading';
import { isBrowser } from '../util/browser';
import { getRoutePath } from '../util/path';
import { addressToItinerarySearch } from '../util/otpStrings';

const SummaryGeolocator = () => <Loading />;

const SummaryGeolocatorWithPosition = connectToStores(
  SummaryGeolocator,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const { from, to } = props.match.params;
    const { location } = props.match;
    const { query } = location;

    const redirect = () => {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newFrom = from === undefined ? locationForUrl : from;
      const newTo = to === undefined || to === 'POS' ? locationForUrl : to;
      const newLocation = {
        ...props.match.location,
        pathname: getRoutePath(newFrom, newTo),
      };
      props.router.replace(newLocation);
    };

    if (isBrowser) {
      if (
        locationState.isLocationingInProgress !== true &&
        locationState.hasLocation === false
      ) {
        checkPositioningPermission().then(status => {
          if (
            // check logic for starting geolocation
            status.state !== 'denied' &&
            locationState.status === 'no-location'
          ) {
            // Auto Initialising geolocation
            context.executeAction(initGeolocation);
          }
          if (status.state === 'denied') {
            redirect();
          }
        });
      } else if (
        locationState.locationingFailed ||
        (locationState.hasLocation &&
          !locationState.isReverseGeocodingInProgress)
      ) {
        redirect();
      }
    }
    return {};
  },
);

SummaryGeolocatorWithPosition.contextTypes = {
  ...SummaryGeolocatorWithPosition.contextTypes,
  executeAction: PropTypes.func.isRequired,
};

export default SummaryGeolocatorWithPosition;
