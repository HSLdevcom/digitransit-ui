import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import includes from 'lodash/includes';
import pull from 'lodash/pull';
import without from 'lodash/without';

import NearestRoutesContainer from './NearestRoutesContainer';

import PanelOrSelectLocation from './PanelOrSelectLocation';
import { dtLocationShape } from '../util/shapes';

function NearbyRoutesPanel(
  { location, currentTime, modes, placeTypes },
  context,
) {
  return (
    <div className="frontpage-panel nearby-routes fullscreen">
      <NearestRoutesContainer
        lat={location.lat}
        lon={location.lon}
        currentTime={currentTime}
        modes={modes}
        placeTypes={placeTypes}
        maxDistance={context.config.nearbyRoutes.radius}
        maxResults={context.config.nearbyRoutes.results || 50}
        timeRange={context.config.nearbyRoutes.timeRange || 7200}
      />
    </div>
  );
}

NearbyRoutesPanel.propTypes = {
  location: dtLocationShape.isRequired,
  currentTime: PropTypes.number.isRequired,
  modes: PropTypes.array.isRequired,
  placeTypes: PropTypes.array.isRequired,
};

NearbyRoutesPanel.contextTypes = {
  config: PropTypes.object,
};

export default connectToStores(
  ctx => (
    <PanelOrSelectLocation
      location={ctx.location}
      panel={NearbyRoutesPanel}
      panelctx={{ ...ctx }}
    />
  ),
  ['TimeStore', 'ModeStore'],
  context => {
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
      currentTime: context
        .getStore('TimeStore')
        .getCurrentTime()
        .unix(),
      modes: modeFilter,
      placeTypes: placeTypeFilter,
    };
  },
);
