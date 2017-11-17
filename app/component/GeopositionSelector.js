import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';
import OriginSelectorRow from './OriginSelectorRow';

const GeopositionSelector = ({ status }, context) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */

  if (status !== PositionStore.STATUS_GEOLOCATION_NOT_SUPPORTED) {
    return (
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
  }
  return null;
};

GeopositionSelector.propTypes = {
  status: PropTypes.string.isRequired,
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
    status: context.getStore('PositionStore').getLocationState().status,
  }),
);
