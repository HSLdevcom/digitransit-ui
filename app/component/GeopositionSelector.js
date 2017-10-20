import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import { startLocationWatch } from '../action/PositionActions';
import PositionStore from '../store/PositionStore';
import Icon from './Icon';
import Loading from './Loading';

const GeopositionSelector = ({ status }, context) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */

  if (status === PositionStore.STATUS_NO_LOCATION) {
    return (
      <li>
        <button
          id="panel-locationing-button"
          className="noborder"
          tabIndex="0"
          onClick={() => context.executeAction(startLocationWatch)}
        >
          <Icon className="icon-positioning" img="icon-icon_position" />
          <FormattedMessage
            id="use-own-position"
            defaultMessage="Use current location"
          />
        </button>
      </li>
    );
  } else if (status === PositionStore.STATUS_SEARCHING_LOCATION) {
    return (
      <div id="geoposition-selector">
        <Loading />
        <div className="spinner-caption">
          <FormattedMessage
            id="splash-locating"
            defaultMessage="Detecting location"
          />…
        </div>
      </div>
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
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  context => ({
    status: context.getStore('PositionStore').getLocationState().status,
  }),
);
