import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import OriginSelector from './OriginSelector';
import GeopositionSelector from './GeopositionSelector';

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

export default connectToStores(
  PanelOrSelectLocation,
  ['EndpointStore'],
  context => {
    const position = context.getStore('PositionStore').getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();
    const nearbyCurrentPosition = origin.useCurrentPosition
      ? position.hasLocation ? position : { lat: null, lon: null }
      : origin.useCurrentPosition || origin.userSetPosition
        ? origin
        : { lat: null, lon: null };

    return {
      location: nearbyCurrentPosition,
    };
  },
);
