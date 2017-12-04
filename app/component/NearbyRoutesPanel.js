import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';

import NearestRoutesContainer from './NearestRoutesContainer';

import PanelOrSelectLocation from './PanelOrSelectLocation';
import { dtLocationShape } from '../util/shapes';
import { TAB_NEARBY } from '../util/path';

function NearbyRoutesPanel({ origin, currentTime }, context) {
  const placeTypes = ['DEPARTURE_ROW'];
  if (context.config.transportModes.citybike.availableForSelection) {
    placeTypes.push('BICYCLE_RENT');
  }

  const modes = Object.keys(context.config.transportModes)
    .filter(mode => context.config.transportModes[mode].availableForSelection)
    .map(mode => mode.toUpperCase());

  return (
    <div className="frontpage-panel nearby-routes fullscreen">
      <NearestRoutesContainer
        lat={origin.lat}
        lon={origin.lon}
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
  origin: dtLocationShape.isRequired, // eslint-disable-line react/no-typos
  currentTime: PropTypes.number.isRequired,
};

NearbyRoutesPanel.contextTypes = {
  config: PropTypes.object,
};

const FilteredNearbyRoutesPanel = onlyUpdateForKeys(['currentTime'])(
  NearbyRoutesPanel,
);

export default connectToStores(
  ctx => (
    <PanelOrSelectLocation
      panel={FilteredNearbyRoutesPanel}
      panelctx={{
        ...ctx,
        tab: TAB_NEARBY,
      }}
    />
  ),
  ['TimeStore'],
  context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  }),
);
