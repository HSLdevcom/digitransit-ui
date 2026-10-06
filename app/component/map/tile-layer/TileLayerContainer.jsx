import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ReactRelayContext } from 'react-relay';
import L from 'leaflet';
import SphericalMercator from '@mapbox/sphericalmercator';
import lodashFilter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import Popup from 'react-leaflet/es/Popup';
import { useLeaflet } from 'react-leaflet/es/context';
import { useRouter } from 'found';
import { vehicleShape } from '../../../../utils/client/shapes';
import { mapLayerShape } from '../../../store/MapLayerStore';
import MarkerSelectPopup from './MarkerSelectPopup';
import LocationPopup from '../popups/LocationPopup';
import TileContainer from './TileContainer';
import { isFeatureLayerEnabled } from '../../../../utils/client/mapLayerUtils';
import RealTimeInformationStore from '../../../store/RealTimeInformationStore';
import { addAnalyticsEvent } from '../../../../utils/shared/analyticsUtils';
import { getClientBreakpoint } from '../../../../utils/client/withBreakpoint';
import {
  stopPagePath,
  PREFIX_BIKESTATIONS,
  PREFIX_CARPARK,
  PREFIX_BIKEPARK,
  PREFIX_RENTALVEHICLES,
} from '../../../../utils/shared/path';
import SelectVehicleContainer from './SelectVehicleContainer';
import { useCurrentTime } from '../../../hooks/TimeContext';
import { useConfigContext } from '../../../client/ConfigContext';

const DEFAULT_OBJECTS_TO_HIDE = { vehicleRentalStations: [] };

const PARKING_LAYERS = ['parkAndRide', 'parkAndRideForBikes'];

// A hub is a single map feature with several nested parking lots. Returns the
// lots relevant for the target's layer, or undefined if the target is not a hub.
function getHubParking({ layer, feature }) {
  return feature.properties?.vehicleParking?.filter(parking =>
    layer === 'parkAndRide' ? parking.carPlaces : parking.bicyclePlaces,
  );
}

// Leaflet fades a closed popup out for 200 ms; its content must stay mounted meanwhile.
const POPUP_FADE_OUT_MS = 250;

let selectionCounter = 0;

const POPUP_OPTIONS = {
  offset: [0, 0],
  autoPanPaddingTopLeft: [5, 125],
  autoPan: false,
};

/**
 * Send an analytics event on opening popup
 */
export function sendSelectionAnalytics(selectableTargets, config) {
  if (!selectableTargets || selectableTargets.length === 0) {
    // event for clicking somewhere else on the map will be handled in LocationPopup
    return;
  }
  let name = null;
  let type = null;
  if (selectableTargets.length === 1) {
    const target = selectableTargets[0];
    const { properties } = target.feature;
    name = target.layer;
    if (name === 'stop') {
      ({ type } = properties);
      if (properties.stops) {
        type += '_TERMINAL';
      }
    }
  } else {
    name = 'multiple';
  }
  const pathPrefixMatch = window.location.pathname.match(/^\/([a-z]{2,})\//);
  const prefix = pathPrefixMatch?.[1];
  const context = prefix && prefix !== config.indexPath ? prefix : 'index';
  addAnalyticsEvent({
    action: 'SelectMapPoint',
    category: 'Map',
    name,
    type,
    source: context,
  });
}

/**
 * Handles a click on a tile. Navigates directly for single targets that have
 * their own page, otherwise toggles the selection popup. Reads the latest
 * props/state via ref, because tiles outlive the render that created them.
 */
function onSelectableTargetClicked(
  latest,
  setSelection,
  tile,
  selectableTargets,
  coords,
  forceOpen = false,
) {
  const {
    props: { mapLayers },
    leaflet: { map },
    router,
    selection,
  } = latest.current;
  const prevCoords = selection?.coords;
  const popup = map._popup; // eslint-disable-line no-underscore-dangle
  const single = selectableTargets.length === 1 ? selectableTargets[0] : null;
  // navigate to citybike stop page if single stop is clicked
  if (single?.layer === 'citybike') {
    router.push(
      `/${PREFIX_BIKESTATIONS}/${encodeURIComponent(
        single.feature.properties.id,
      )}`,
    );
    return;
  }
  if (
    single?.layer === 'scooter' ||
    (selectableTargets.length > 1 &&
      selectableTargets.every(target => target.layer === 'scooter'))
    // scooters are not shown in the selection popup as there can be too many.
    // Instead, the user is directed to the scooter cluster view or the first one in a group of singles.
  ) {
    const cluster = selectableTargets.find(
      target => target.feature.properties.cluster,
    );
    const networks = cluster?.feature.properties.networks ?? '';
    const id = cluster
      ? cluster.feature.properties.scooterId
      : selectableTargets[0].feature.properties.id;
    // adding networks directs to scooter cluster view
    router.push(
      `/${PREFIX_RENTALVEHICLES}/${encodeURIComponent(id)}/${[...networks]}`,
    );
    return;
  }
  // ... Or to stop page
  if (single?.layer === 'stop') {
    router.push(
      stopPagePath(
        single.feature.properties.stops,
        single.feature.properties.gtfsId,
      ),
    );
    return;
  }

  if (PARKING_LAYERS.includes(single?.layer)) {
    const hubParking = getHubParking(single);
    let parkingId;
    if (hubParking) {
      if (hubParking.length === 1) {
        parkingId = hubParking[0].id;
      }
    } else {
      parkingId = single.feature.properties?.id;
    }
    if (parkingId) {
      router.push(
        `/${
          single.layer === 'parkAndRide' ? PREFIX_CARPARK : PREFIX_BIKEPARK
        }/${encodeURIComponent(parkingId)}`,
      );
      return;
    }
  }

  if (popup?.isOpen() && (!forceOpen || coords?.equals(prevCoords))) {
    map.closePopup();
    return;
  }

  selectionCounter += 1;
  setSelection({
    // a new id remounts the popup, so one still fading out is never reused
    id: selectionCounter,
    selectableTargets: selectableTargets.filter(
      target =>
        target.layer === 'realTimeVehicle' ||
        isFeatureLayerEnabled(target.feature, target.layer, mapLayers),
    ),
    coords,
    zoom: tile.coords.z,
  });
}

function createTile(tileCoords, done, latest, setSelection) {
  const { props, config, relayEnvironment } = latest.current;
  const tile = new TileContainer(
    tileCoords,
    done,
    props,
    config,
    props.mergeStops,
    relayEnvironment,
    props.highlightedStops,
    props.vehicles,
    props.stopsToShow,
    props.objectsToHide,
    config.language,
  );
  tile.onSelectableTargetClicked = (...args) =>
    onSelectableTargetClicked(latest, setSelection, tile, ...args);
  return tile.el;
}

function getLayerOptions(props, leaflet) {
  const { map } = leaflet;
  const options = {
    tileSize: props.tileSize,
    zoomOffset: props.zoomOffset,
  };
  const pane = props.pane ?? leaflet.pane;
  if (pane != null) {
    options.pane = pane;
  }
  if (map?.options?.maxZoom != null) {
    options.maxZoom = map.options.maxZoom;
  }
  if (map?.options?.minZoom != null) {
    options.minZoom = map.options.minZoom;
  }
  return options;
}

function TileLayerContainer(props) {
  const {
    locationPopup,
    onSelectLocation,
    mapLayers,
    highlightedStops,
    vehicles,
  } = props;
  const currentTime = useCurrentTime();
  const config = useConfigContext();
  const { router } = useRouter();
  const { environment: relayEnvironment } = useContext(ReactRelayContext);
  const leaflet = useLeaflet();
  const [selection, setSelection] = useState(null);

  // Tile callbacks outlive renders, so they read current values through this ref.
  const latest = useRef();
  latest.current = {
    props: {
      ...props,
      mergeStops: props.mergeStops ?? true,
      objectsToHide: props.objectsToHide ?? DEFAULT_OBJECTS_TO_HIDE,
    },
    config,
    router,
    relayEnvironment,
    leaflet,
    selection,
  };

  const instance = useRef(null);
  if (instance.current === null) {
    const layer = new L.GridLayer(getLayerOptions(props, leaflet));
    layer.createTile = (tileCoords, done) =>
      createTile(tileCoords, done, latest, setSelection);
    instance.current = {
      layer,
      merc: new SphericalMercator({ size: props.tileSize || 256 }),
    };
  }
  const { layer, merc } = instance.current;

  useEffect(() => {
    const { map, layerContainer } = leaflet;
    const container = layerContainer || map;
    /* eslint-disable no-underscore-dangle */
    const onClick = e => {
      Object.keys(layer._tiles)
        .filter(key => layer._tiles[key].active)
        .filter(key => layer._keyToBounds(key).contains(e.latlng))
        .forEach(key =>
          layer._tiles[key].el.onMapClick(
            e,
            merc.px(
              [e.latlng.lng, e.latlng.lat],
              Number(key.split(':')[2]) + latest.current.props.zoomOffset,
            ),
          ),
        );
    };
    /* eslint-enable no-underscore-dangle */
    container.addLayer(layer);
    map.addEventParent(layer);
    layer.on('click contextmenu', onClick);
    return () => {
      layer.off('click contextmenu', onClick);
      map.removeEventParent(layer);
      container.removeLayer(layer);
    };
  }, []);

  const previous = useRef({ mapLayers, highlightedStops, currentTime });
  useEffect(() => {
    const prev = previous.current;
    previous.current = { mapLayers, highlightedStops, currentTime };
    if (
      !isEqual(prev.mapLayers, mapLayers) ||
      !isEqual(prev.highlightedStops, highlightedStops)
    ) {
      layer.redraw();
    }
    if (prev.currentTime !== currentTime) {
      /* eslint-disable no-underscore-dangle */
      lodashFilter(layer._tiles, tile => tile.active).forEach(tile =>
        tile.el.layers?.forEach(l => l.onTimeChange?.(config.language)),
      );
      /* eslint-enable no-underscore-dangle */
    }
  });

  const closeTimer = useRef();
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const closePopup = useCallback(() => {
    const closing = latest.current.selection;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => setSelection(current => (current === closing ? null : current)),
      POPUP_FADE_OUT_MS,
    );
  }, []);
  const onPopupOpen = useCallback(
    () =>
      sendSelectionAnalytics(
        latest.current.selection?.selectableTargets,
        latest.current.config,
      ),
    [],
  );
  const selectRow = useCallback(
    option => setSelection(prev => ({ ...prev, selectableTargets: [option] })),
    [],
  );

  if (!selection) {
    return null;
  }

  const { selectableTargets, coords, zoom } = selection;
  const popupOptions = {
    ...POPUP_OPTIONS,
    onClose: closePopup,
    onOpen: onPopupOpen,
  };
  const smallScreenPopupHidden =
    !config.map.showStopMarkerPopupOnMobile &&
    getClientBreakpoint() === 'small';

  if (selectableTargets.length === 1) {
    const target = selectableTargets[0];
    let id;
    let contents;
    let latlng = coords;
    const isVehicle = target.layer === 'realTimeVehicle';
    if (
      PARKING_LAYERS.includes(target.layer) &&
      getHubParking(target)?.length > 1
    ) {
      id = `parkAndRide_${target.feature.properties.vehicleParking[0].id}`;
      contents = (
        <MarkerSelectPopup selectRow={selectRow} options={selectableTargets} />
      );
    } else if (isVehicle) {
      const { vehicle } = target.feature;
      const realTimeInfoVehicle = vehicles[vehicle.id];
      if (realTimeInfoVehicle) {
        latlng = {
          lat: realTimeInfoVehicle.lat,
          lng: realTimeInfoVehicle.long,
        };
      }
      contents = <SelectVehicleContainer vehicle={vehicle} />;
    }
    return (
      <Popup
        {...popupOptions}
        key={`${selection.id}:${id ?? 'single'}`}
        position={latlng}
        className={
          isVehicle ? 'vehicle-popup single-popup' : 'popup choice-popup'
        }
      >
        {contents}
      </Popup>
    );
  }

  if (smallScreenPopupHidden) {
    return null;
  }

  if (selectableTargets.length > 1) {
    return (
      <Popup
        key={`${selection.id}:multi`}
        {...popupOptions}
        position={coords}
        maxWidth="300px"
        className="popup choice-popup"
      >
        <MarkerSelectPopup
          selectRow={selectRow}
          options={selectableTargets}
          zoom={zoom}
        />
      </Popup>
    );
  }

  if (locationPopup === 'none') {
    return null;
  }
  return (
    <Popup
      key={`${selection.id}:location`}
      {...popupOptions}
      maxHeight={220}
      maxWidth="auto"
      position={coords}
      className={`popup ${
        locationPopup === 'all' ? 'single-popup' : 'narrow-popup'
      }`}
    >
      <LocationPopup
        lat={coords.lat}
        lon={coords.lng}
        onSelectLocation={onSelectLocation}
        locationPopup={locationPopup}
      />
    </Popup>
  );
}

TileLayerContainer.propTypes = {
  tileSize: PropTypes.number.isRequired,
  zoomOffset: PropTypes.number.isRequired,
  locationPopup: PropTypes.string, // all, none, reversegeocoding, origindestination
  onSelectLocation: PropTypes.func,
  mergeStops: PropTypes.bool,
  mapLayers: mapLayerShape.isRequired,
  // When true, clicks on map icons (stops, terminals, citybikes, etc.)
  // are ignored instead of selecting/navigating to them.
  disableIconClick: PropTypes.bool,
  highlightedStops: PropTypes.arrayOf(PropTypes.string),
  stopsToShow: PropTypes.arrayOf(PropTypes.string),
  objectsToHide: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  vehicles: PropTypes.objectOf(vehicleShape),
};

const connectedComponent = connectToStores(
  TileLayerContainer,
  [RealTimeInformationStore],
  context => ({
    vehicles: context.getStore(RealTimeInformationStore).vehicles,
  }),
);

export { connectedComponent as default, TileLayerContainer as Component };
