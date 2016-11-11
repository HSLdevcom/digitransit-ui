import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

import { startLocationWatch } from '../../action/PositionActions';
import PositionStore from '../../store/PositionStore';
import Icon from '../icon/Icon';

const GeopositionSelector = ({ state }) => {
  /* States:
   * - locationing hasn't been started
   * . locationing in progress
   * . locationing denied
   * . locationing failed
   * - locationing succeeded
   */
  console.log(state.status);
  if (state.status == PositionStore.STATUS_NO_LOCATION) {
    return (
      <div>
        <FormattedMessage
         id="please-allow-locationing"
         defaultMessage="The service offers it's best if you allow locationing."
        />
        <span
          id="splash-locationing-button"
          onClick={() => context.executeAction(startLocationWatch)}
        >
          <Icon className="icon-locationing" img="icon-icon_position" />
          Use locationing!
        </span>
      </div>
    );
  } else if (state.status == PositionStore.STATUS_SEARCHING_LOCATION) {
    return (
      <div id="geoposition-selector">
        <div className="spinner-loader" />
        <div className="spinner-caption">
          <FormattedMessage id="locating" defaultMessage="Locating" />…
        </div>
      </div>);
  } else if (state.status == PositionStore.STATUS_GEOLOCATION_DENIED) {
    return <div>Sowwy, I can't do a thing if you won't let me</div>;
  }
  return null;
};

GeopositionSelector.propTypes = {
  state: React.PropTypes.object,
};

GeopositionSelector.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  (context) => (
    { state: context.getStore('PositionStore').getLocationState() }
  ));
