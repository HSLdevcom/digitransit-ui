import React, { PropTypes } from 'react';
import ModeFilterContainer from '../route/mode-filter-container';
import NearestRoutesContainer from './NearestRoutesContainer';
import NextDeparturesListHeader from '../departure/next-departures-list-header';
import connectToStores from 'fluxible-addons-react/connectToStores';

function NearbyRoutesPanel({ location, currentTime, modes }) {
  return (
    <div className="frontpage-panel nearby-routes">
      <div className="row">
        <div className="small-12 column">
          <ModeFilterContainer id="nearby-routes-mode" />
        </div>
      </div>
      <NextDeparturesListHeader />
      <div
        className="scrollable momentum-scroll scroll-extra-padding-bottom"
        id="scrollable-routes"
      >
        <NearestRoutesContainer
          lat={location.lat}
          lon={location.lon}
          currentTime={currentTime}
          modes={modes}
        />
      </div>
    </div>
  );
}

NearbyRoutesPanel.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  currentTime: PropTypes.number.isRequired,
  modes: PropTypes.array.isRequired,
};

export default connectToStores(
  NearbyRoutesPanel,
  ['EndpointStore', 'TimeStore', 'ModeStore'],
  (context) => {
    const position = context.getStore('PositionStore').getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();

    return {
      location: origin.useCurrentPosition ? position : origin,
      currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
      modes: context.getStore('ModeStore').getMode(),
    };
  }
);
