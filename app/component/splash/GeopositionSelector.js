import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

import { startLocationWatch } from '../../action/PositionActions';
import PositionStore from '../../store/PositionStore';
import Icon from '../icon/Icon';

const GeopositionSelector = ({ status }) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */
  console.log(status);
  if (status === PositionStore.STATUS_NO_LOCATION) {
    return (
      <div>
        <span id="splash-text-block">
          <FormattedMessage
            id="splash-please-allow-positioning"
            defaultMessage="The service offers it's best if you allow locationing."
          /></span>
        <span
          id="splash-locationing-button"
          onClick={() => context.executeAction(startLocationWatch)}
        >
          <Icon className="icon-positioning" img="icon-icon_position" />
          <FormattedMessage
            id="splash-use-positioning"
            defaultMessage="Use positioning!"
          />
        </span>
      </div>
    );
  } else if (status === PositionStore.STATUS_SEARCHING_LOCATION) {
    return (
      <div id="geoposition-selector">
        <div className="spinner-loader" />
        <div className="spinner-caption">
          <FormattedMessage id="splash-locating" defaultMessage="Locating" />…
        </div>
      </div>);
  } else if (status === PositionStore.STATUS_GEOLOCATION_DENIED) {
    return (<div><FormattedMessage
      id="geolocation-denied-medssage"
      defaultMessage="Sorry, I can't do a thing if you won't let me"
    /></div>);
  }
  return null;
};

GeopositionSelector.propTypes = {
  status: React.PropTypes.string.isRequired,
};

GeopositionSelector.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  context => (
    { status: context.getStore('PositionStore').getLocationState().status }
  ));
