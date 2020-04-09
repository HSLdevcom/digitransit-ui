import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import MapWithTracking from './MapWithTracking';
import withBreakpoint from '../../util/withBreakpoint';
import SelectMapLayersDialog from '../SelectMapLayersDialog';
import SelectStreetModeDialog from '../SelectStreetModeDialog';
import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import { dtLocationShape } from '../../util/shapes';
import * as ModeUtils from '../../util/modeUtils';
import Icon from '../Icon';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const renderMapLayerSelector = () => <SelectMapLayersDialog />;

const renderStreetModeSelector = (config, router, match) => (
  <SelectStreetModeDialog
    selectedStreetMode={ModeUtils.getStreetMode(match.location, config)}
    selectStreetMode={(streetMode, isExclusive) => {
      addAnalyticsEvent({
        category: 'ItinerarySettings',
        action: 'SelectTravelingModeFromIndexPage',
        name: streetMode,
      });
      ModeUtils.setStreetMode(streetMode, config, router, match, isExclusive);
    }}
    streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
  />
);

function IndexPageMap(
  { match, router, breakpoint, origin, destination },
  { config },
) {
  const [mapExpanded, toggleFullscreen] = useState(false);

  let map;
  if (breakpoint === 'large') {
    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops
        showScaleBar
        origin={origin}
        destination={destination}
        renderCustomButtons={() => (
          <>
            {config.map.showStreetModeSelector &&
              renderStreetModeSelector(config, router, match)}
            {config.map.showLayerSelector && renderMapLayerSelector()}
          </>
        )}
      />
    );
  } else {
    map = (
      <>
        <div
          className={cx('flex-grow', 'map-container', {
            expanded: mapExpanded,
          })}
        >
          <MapWithTracking
            breakpoint={breakpoint}
            showStops
            origin={origin}
            destination={destination}
            renderCustomButtons={() => (
              <>
                {config.map.showStreetModeSelector &&
                  renderStreetModeSelector(config, router, match)}
                {config.map.showLayerSelector && renderMapLayerSelector()}
              </>
            )}
          />
        </div>
        {/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div style={{ position: 'relative' }}>
          <div
            className={cx('fullscreen-toggle', {
              expanded: mapExpanded,
            })}
            onClick={() => toggleFullscreen(!mapExpanded)}
          >
            {mapExpanded ? (
              <Icon img="icon-icon_minimize" className="cursor-pointer" />
            ) : (
              <Icon img="icon-icon_maximize" className="cursor-pointer" />
            )}
          </div>
        </div>
        {/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      </>
    );
  }

  return map;
}

IndexPageMap.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
};

IndexPageMap.defaultProps = {
  origin: {},
  destination: {},
};

IndexPageMap.contextTypes = {
  config: PropTypes.object.isRequired,
};

const IndexPageMapWithBreakpoint = withBreakpoint(IndexPageMap);

const IndexPageMapWithStores = connectToStores(
  IndexPageMapWithBreakpoint,
  [OriginStore, DestinationStore],
  ({ getStore }) => {
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();

    return {
      origin,
      destination,
    };
  },
);

export {
  IndexPageMapWithStores as default,
  IndexPageMapWithBreakpoint as Component,
};
