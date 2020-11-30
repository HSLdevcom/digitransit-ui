/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { startLocationWatch } from '../action/PositionActions';
import { isBrowser } from '../util/browser';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';

export default function withGeomover(WrappedComponent) {
  const geomover = connectToStores(
    props => <WrappedComponent {...props} />,
    ['PositionStore'],
    context => {
      if (isBrowser) {
        const origin = context.getStore('OriginStore').getOrigin();
        const destination = context
          .getStore('DestinationStore')
          .getDestination();
        const locationState = context
          .getStore('PositionStore')
          .getLocationState();
        let target;
        let action;

        if (origin.type === 'CurrentLocation') {
          target = { ...origin };
          action = storeOrigin;
        } else if (destination.type === 'CurrentLocation') {
          target = { ...destination };
          action = storeDestination;
        }
        if (action) {
          if (locationState.locationingFailed) {
            target.type = undefined;
            target.address = undefined;
            context.executeAction(action, target);
          } else if (!target.address) {
            target.address = context.intl.formatMessage({
              id: 'own-position',
              defaultMessage: 'Own Location',
            });
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
            target.address = locationState.address;
            target.lat = locationState.lat;
            target.lon = locationState.lon;
            context.executeAction(action, target);
          }
        }
      }
    },
  );

  geomover.contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  return geomover;
}
