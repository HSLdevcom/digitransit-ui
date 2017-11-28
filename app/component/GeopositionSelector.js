import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import { dtLocationShape } from '../util/shapes';
import { navigateTo } from '../util/path';

import { startLocationWatch } from '../action/PositionActions';
import OriginSelectorRow from './OriginSelectorRow';

const GeopositionSelector = (props, context) =>
  props.locationState.locationingFailed ? null : (
    <OriginSelectorRow
      key={`panel-locationing-button`}
      icon="icon-icon_position"
      onClick={() => {
        context.executeAction(startLocationWatch, {
          onPositioningStarted: () => {
            let destination = { ...props.destination };
            if (destination.gps === true) {
              destination = { ready: false, set: false };
            }
            navigateTo({
              origin: { gps: true, ready: false },
              destination,
              context: '/',
              router: context.router,
              tab: props.tab,
            });
          },
        });
      }}
      label={context.intl.formatMessage({
        id: 'use-own-position',
        defaultMessage: 'Use current location',
      })}
    />
  );

GeopositionSelector.propTypes = {
  origin: dtLocationShape,
  destination: dtLocationShape,
  tab: PropTypes.string.isRequired,
  locationState: PropTypes.shape({
    locationingFailed: PropTypes.bool.isRequired,
  }).isRequired,
};
GeopositionSelector.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  intl: intlShape.isRequired,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  context => ({
    locationState: context.getStore('PositionStore').getLocationState(),
  }),
);
