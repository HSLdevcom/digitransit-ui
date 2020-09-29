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
import withSearchContext from './WithSearchContext';
import { isBrowser } from '../util/browser';
import { getRoutePath } from '../util/path';
import { addressToItinerarySearch } from '../util/otpStrings';

const SummaryGeolocator = () => <div> GEOLOCATION IN PROGRESS </div>;

const SummaryGeolocatorWithPosition = connectToStores(
  SummaryGeolocator,
  ['PositionStore'],
  (context, props) => {
    const locationState = context.getStore('PositionStore').getLocationState();

    const { from, to } = props.match.params;
    const { location } = props.match;
    const { query } = location;

    if (
      isBrowser &&
      locationState.isLocationingInProgress !== true &&
      locationState.hasLocation === false &&
      (from === 'POS' || to === 'POS')
    ) {
      checkPositioningPermission().then(status => {
        if (
          // check logic for starting geolocation
          status.state === 'granted' &&
          locationState.status === 'no-location'
        ) {
          // Auto Initialising geolocation
          context.executeAction(initGeolocation);
        } else if (status.state === 'prompt') {
          // Still prompting;
          // eslint-disable-next-line no-useless-return
          return;
        } else {
          const locationForUrl = addressToItinerarySearch(locationState);
          const newFrom = from === 'POS' ? locationForUrl : from;
          const newTo = to === 'POS' ? locationForUrl : to;
          const newLocation = {
            ...props.match.location,
            pathname: getRoutePath(newFrom, newTo),
          };
          props.router.replace(newLocation);
        }
      });
    }
    return {};
  },
);

SummaryGeolocatorWithPosition.contextTypes = {
  ...SummaryGeolocatorWithPosition.contextTypes,
  executeAction: PropTypes.func.isRequired,
};

export default SummaryGeolocatorWithPosition;
