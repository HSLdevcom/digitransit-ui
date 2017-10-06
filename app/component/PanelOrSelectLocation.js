import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import OriginSelector from './OriginSelector';

const PanelOrSelectLocation = ({ panel, location, panelctx }) => {
  if (location.lat && location.lon) {
    return React.createElement(panel, panelctx);
  }
  return (
    <div className="frontpage-panel">
      <div id="nolocation-panel" key="contents" className="flex-vertical">
        <p>
          <FormattedMessage
            id="splash-choose"
            defaultMessage="Select your origin"
          />
        </p>
        <OriginSelector />
      </div>
    </div>
  );
};

PanelOrSelectLocation.propTypes = {
  panel: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
  panelctx: PropTypes.object.isRequired,
};

export default connectToStores(
  PanelOrSelectLocation,
  ['EndpointStore'],
  context => {
    const position = context.getStore('PositionStore').getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();

    let nearbyCurrentPosition;
    if (origin.useCurrentPosition) {
      nearbyCurrentPosition = position.hasLocation
        ? position
        : { lat: null, lon: null };
    } else {
      nearbyCurrentPosition =
        origin.useCurrentPosition || origin.userSetPosition
          ? origin
          : { lat: null, lon: null };
    }

    return {
      location: nearbyCurrentPosition,
    };
  },
);
