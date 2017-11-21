import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { startLocationWatch } from '../action/PositionActions';
import OriginSelectorRow from './OriginSelectorRow';

const GeopositionSelector = (props, context) => (
  <OriginSelectorRow
    key={`panel-locationing-button`}
    icon="icon-icon_position"
    onClick={() => context.executeAction(startLocationWatch)}
    label={context.intl.formatMessage({
      id: 'use-own-position',
      defaultMessage: 'Use current location',
    })}
  />
);

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
    status: context.getStore('PositionStore').getLocationState().status,
  }),
);
