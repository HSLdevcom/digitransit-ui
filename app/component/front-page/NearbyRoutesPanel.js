import React, { PropTypes } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import includes from 'lodash/includes';
import pull from 'lodash/pull';
import without from 'lodash/without';

import ModeFilterContainer from '../route/ModeFilterContainer';
import NearestRoutesContainer from './NearestRoutesContainer';
import NextDeparturesListHeader from '../departure/next-departures-list-header';
import config from '../../config';

function NearbyRoutesPanel({ location, currentTime, modes, placeTypes }) {
  return (
    <div className="frontpage-panel nearby-routes fullscreen">
      {config.showModeFilter &&
        (<div className="row">
          <div className="small-12 column">
            <ModeFilterContainer id="nearby-routes-mode" />
          </div>
        </div>)}
      <NextDeparturesListHeader />
      <div
        className="scrollable momentum-scroll nearby"
        id="scrollable-routes"
      >
        <NearestRoutesContainer
          lat={location.lat}
          lon={location.lon}
          currentTime={currentTime}
          modes={modes}
          placeTypes={placeTypes}
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
  placeTypes: PropTypes.array.isRequired,
};

export default connectToStores(
  NearbyRoutesPanel,
  ['EndpointStore', 'TimeStore', 'ModeStore'],
  (context) => {
    const position = context.getStore('PositionStore').getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();
    const modes = context.getStore('ModeStore').getMode();
    const bicycleRent = includes(modes, 'BICYCLE_RENT');
    const modeFilter = without(modes, 'BICYCLE_RENT');
    let placeTypeFilter = ['DEPARTURE_ROW', 'BICYCLE_RENT'];

    if (!bicycleRent) {
      pull(placeTypeFilter, 'BICYCLE_RENT');
    } else if (modes.length === 1) {
      placeTypeFilter = ['BICYCLE_RENT'];
    }

    return {
      location: origin.useCurrentPosition ? position : origin,
      currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
      modes: modeFilter,
      placeTypes: placeTypeFilter,
    };
  }
);
