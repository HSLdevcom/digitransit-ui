import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

const GeopositionSelector = ({ state }) => {
  if (state.isLocationingInProgress) {
    return (
      <div id="geoposition-selector">
        <div className="spinner-loader" />
        <div className="spinner-caption">
          <FormattedMessage id="locating" defaultMessage="Locating" />…
        </div>
      </div>);
  }
  return null;
};

GeopositionSelector.propTypes = {
  state: React.PropTypes.object,
};

export default connectToStores(
  GeopositionSelector,
  ['PositionStore'],
  (context) => (
    { state: context.getStore('PositionStore').getLocationState() }
  ));
