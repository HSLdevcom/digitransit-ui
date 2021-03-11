import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape } from 'found';
import isEqual from 'lodash/isEqual';
import MapWithTracking from './MapWithTracking';
import withBreakpoint from '../../util/withBreakpoint';
import SelectMapLayersDialog from '../SelectMapLayersDialog';
import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { dtLocationShape } from '../../util/shapes';
import { parseLocation } from '../../util/path';
import storeOrigin from '../../action/originActions';
import storeDestination from '../../action/destinationActions';
// eslint-disable-next-line import/no-named-as-default
import SettingsDrawer from '../SettingsDrawer';

const renderMapLayerSelector = setOpen => (
  <SelectMapLayersDialog setOpen={setOpen} />
);

const locationMarkerModules = {
  LocationMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './LocationMarker')),
};
let previousFocusPoint;
let previousMapTracking;

function IndexPageMap(
  { match, breakpoint, origin, destination },
  { config, executeAction },
) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const originFromURI = parseLocation(match.params.from);
  const destinationFromURI = parseLocation(match.params.to);
  let focusPoint;
  let initialZoom = 16; // Focus to the selected point
  const useDefaultLocation =
    (!origin || !origin.lat) && (!destination || !destination.lat);
  if (useDefaultLocation) {
    focusPoint = config.defaultMapCenter || config.defaultEndpoint;
    initialZoom = 12; // Show default area
  } else if (origin.lat) {
    focusPoint = origin;
  } else if (destination.lat) {
    focusPoint = destination;
  }

  const mwtProps = {};

  const mapTracking =
    (origin && origin.type === 'CurrentLocation') ||
    (destination && destination.type === 'CurrentLocation');
  if (previousFocusPoint && previousFocusPoint.gps && !mapTracking) {
    previousMapTracking = false;
    mwtProps.mapTracking = false;
  } else if (previousMapTracking !== mapTracking) {
    previousMapTracking = mapTracking;
    mwtProps.mapTracking = mapTracking;
  }
  const focusPointChanged =
    !previousFocusPoint || !isEqual(previousFocusPoint, focusPoint);
  if (focusPointChanged && focusPoint && focusPoint.lat && focusPoint.lon) {
    previousFocusPoint = focusPoint;
    mwtProps.focusPoint = focusPoint;
    initialZoom = 16;
    if (focusPoint.type !== 'CurrentLocation') {
      mwtProps.mapTracking = false;
    }
  }
  if (originFromURI.lat || destinationFromURI.lat) {
    // Origin or destination from URI
    mwtProps.focusPoint = originFromURI.lat
      ? originFromURI
      : destinationFromURI;
    initialZoom = 16;
  }
  const leafletObjs = [];

  if (origin && origin.lat) {
    leafletObjs.push(
      <LazilyLoad modules={locationMarkerModules} key="from">
        {({ LocationMarker }) => (
          <LocationMarker position={origin} type="from" />
        )}
      </LazilyLoad>,
    );
  }

  if (destination && destination.lat) {
    leafletObjs.push(
      <LazilyLoad modules={locationMarkerModules} key="to">
        {({ LocationMarker }) => (
          <LocationMarker position={destination} type="to" />
        )}
      </LazilyLoad>,
    );
  }

  let map;
  if (breakpoint === 'large') {
    const selectLocation = (item, id) => {
      if (id === 'origin') {
        executeAction(storeOrigin, item);
      } else {
        executeAction(storeDestination, item);
      }
    };

    map = (
      <>
        <MapWithTracking
          breakpoint={breakpoint}
          // TODO: Fix an issue where map doesn't center to right place when user is coming to indexPage with origin or destination set with url
          defaultMapCenter={config.defaultMapCenter || config.defaultEndpoint}
          showStops
          showScaleBar
          {...mwtProps}
          showLocationMessages
          initialZoom={initialZoom}
          leafletObjs={leafletObjs}
          locationPopup="origindestination"
          onSelectLocation={selectLocation}
          renderCustomButtons={() => (
            <>
              {config.map.showLayerSelector &&
                renderMapLayerSelector(setSettingsOpen)}
            </>
          )}
        />
        <SettingsDrawer
          onToggleClick={() => {
            return null;
          }}
          open={isSettingsOpen}
          settingsType="MapLayer"
          setOpen={setSettingsOpen}
        />
      </>
    );
  } else {
    map = (
      <>
        <div className={cx('flex-grow', 'map-container')}>
          <MapWithTracking
            breakpoint={breakpoint}
            showStops
            {...mwtProps}
            defaultMapCenter={config.defaultMapCenter || config.defaultEndpoint}
            leafletObjs={leafletObjs}
            renderCustomButtons={() => (
              <>
                {config.map.showLayerSelector &&
                  renderMapLayerSelector(setSettingsOpen)}
              </>
            )}
          />
        </div>
      </>
    );
  }

  return map;
}

IndexPageMap.propTypes = {
  match: matchShape.isRequired,
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
  executeAction: PropTypes.func.isRequired,
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
