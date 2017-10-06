import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import includes from 'lodash/includes';
import pull from 'lodash/pull';
import without from 'lodash/without';

import NearestRoutesContainer from './NearestRoutesContainer';
import NextDeparturesListHeader from './NextDeparturesListHeader';

import PanelOrSelectLocation from './PanelOrSelectLocation';
import { dtLocationShape } from '../util/shapes';

function NearbyRoutesPanel(
  { location, currentTime, modes, placeTypes },
  context,
) {
  return (
    <div className="frontpage-panel nearby-routes fullscreen">
      <NextDeparturesListHeader />,
      <div className="scrollable momentum-scroll nearby" id="scrollable-routes">
        {(location.lat &&
          location.lon && (
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
          )) ||
          null}
      </div>
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
    <PanelOrSelectLocation panel={NearbyRoutesPanel} panelctx={{ ...ctx }} />
  ),
  ['EndpointStore', 'TimeStore', 'ModeStore'],
  context => {
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
      currentTime: context
        .getStore('TimeStore')
        .getCurrentTime()
        .unix(),
      modes: modeFilter,
      placeTypes: placeTypeFilter,
    };
  },
);
