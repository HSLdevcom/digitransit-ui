import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import MapWithTracking from './MapWithTracking';
import { sameLocations } from '../../util/path';
import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { dtLocationShape } from '../../util/shapes';

import storeOrigin from '../../action/originActions';
import storeDestination from '../../action/destinationActions';
// eslint-disable-next-line import/no-named-as-default
import SettingsDrawer from '../SettingsDrawer';
import BubbleDialog from '../BubbleDialog';
import MapLayersDialogContent from '../MapLayersDialogContent';
import { mapLayerShape } from '../../store/MapLayerStore';

const renderMapLayerSelector = (isOpen, setOpen, config, lang) => {
  const tooltip =
    config.mapLayers &&
    config.mapLayers.tooltip &&
    config.mapLayers.tooltip[lang];
  return (
    <BubbleDialog
      contentClassName="select-map-layers-dialog-content"
      header="select-map-layers-header"
      icon="map-layers"
      id="mapLayerSelectorV2"
      isFullscreenOnMobile
      isOpen={isOpen}
      tooltip={tooltip}
      setOpen={setOpen}
    />
  );
};

const locationMarkerModules = {
  LocationMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './LocationMarker')),
};

let focus1 = {};

function IndexPageMap(
  { origin, destination, lang, mapLayers },
  { config, executeAction, intl },
) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  let focus2;
  let zoom = 16;

  if (origin.lat) {
    focus2 = origin;
  } else if (destination.lat) {
    focus2 = destination;
  } else {
    focus2 = config.defaultEndpoint;
    zoom = 12;
  }
  const mwtProps = {};

  if (!sameLocations(focus1, focus2)) {
    // feed in new props to map
    if (focus2.type === 'CurrentLocation') {
      mwtProps.mapTracking = true;
    }
    mwtProps.zoom = zoom;
    mwtProps.lat = focus2.lat;
    mwtProps.lon = focus2.lon;
    focus1 = { ...focus2 };
  }

  const leafletObjs = [];

  if (origin.lat) {
    leafletObjs.push(
      <LazilyLoad modules={locationMarkerModules} key="from">
        {({ LocationMarker }) => (
          <LocationMarker position={origin} type="from" />
        )}
      </LazilyLoad>,
    );
  }

  if (destination.lat) {
    leafletObjs.push(
      <LazilyLoad modules={locationMarkerModules} key="to">
        {({ LocationMarker }) => (
          <LocationMarker position={destination} type="to" />
        )}
      </LazilyLoad>,
    );
  }

  const selectLocation = (item, id) => {
    if (id === 'origin') {
      executeAction(storeOrigin, item);
    } else {
      executeAction(storeDestination, item);
    }
  };

  return (
    <>
      <MapWithTracking
        {...mwtProps}
        mapLayers={mapLayers}
        leafletObjs={leafletObjs}
        locationPopup="origindestination"
        onSelectLocation={selectLocation}
        renderCustomButtons={() => (
          <>
            {config.map.showLayerSelector &&
              renderMapLayerSelector(
                isSettingsOpen,
                setSettingsOpen,
                config,
                lang,
              )}
          </>
        )}
        vehicles
      />
      <SettingsDrawer
        onToggleClick={() => {
          return null;
        }}
        open={isSettingsOpen}
        settingsType="MapLayer"
        setOpen={setSettingsOpen}
        className="offcanvas-layers"
      >
        <MapLayersDialogContent
          open={isSettingsOpen}
          setOpen={setSettingsOpen}
        />
        <button
          className="desktop-button"
          onClick={() => setSettingsOpen(false)}
        >
          {intl.formatMessage({ id: 'close', defaultMessage: 'Close' })}
        </button>
      </SettingsDrawer>
    </>
  );
}

IndexPageMap.propTypes = {
  match: matchShape.isRequired,
  lang: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  mapLayers: mapLayerShape.isRequired,
};

IndexPageMap.defaultProps = {
  origin: {},
  destination: {},
};

IndexPageMap.contextTypes = {
  config: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const IndexPageMapWithStores = connectToStores(
  IndexPageMap,
  [OriginStore, DestinationStore, 'PreferencesStore', 'MapLayerStore'],
  ({ getStore }) => {
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();
    const lang = getStore('PreferencesStore').getLanguage();

    return {
      origin,
      destination,
      lang,
      mapLayers: getStore('MapLayerStore').getMapLayers(),
    };
  },
);

export { IndexPageMapWithStores as default, IndexPageMap as Component };
