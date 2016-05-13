import React, { PropTypes } from 'react';
import ModeFilterContainer from '../route/mode-filter-container';
import NearestRoutesContainer from './nearest-routes-container';
import NextDeparturesListHeader from '../departure/next-departures-list-header';
import connectToStores from 'fluxible-addons-react/connectToStores';

function NearbyRoutesPanel({ location }) {
  return (
    <div className="frontpage-panel nearby-routes">
      <div className="row">
        <div className="medium-offset-3 medium-6 small-12 column">
          <ModeFilterContainer id="nearby-routes-mode" />
        </div>
      </div>
      <NextDeparturesListHeader />
      <div
        className="scrollable momentum-scroll scroll-extra-padding-bottom"
        id="scrollable-routes"
      >
        <NearestRoutesContainer lat={location.lat} lon={location.lon} />
      </div>
    </div>);
}

NearbyRoutesPanel.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
};

export default connectToStores(NearbyRoutesPanel, ['EndpointStore'], (context) => {
  const position = context.getStore('PositionStore').getLocationState();
  const origin = context.getStore('EndpointStore').getOrigin();

  return {
    location: origin.useCurrentPosition ? position : origin,
  };
});
