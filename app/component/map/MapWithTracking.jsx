import PropTypes from 'prop-types';
import React, { memo, useEffect, useRef, useState } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { useIntl } from 'react-intl';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { mapLayerOptionsShape } from '../../../utils/client/shapes';
import { startLocationWatch } from '../../action/PositionActions';
import MapContainer from './MapContainer';
import MapControlButton from './MapControlButton';
import PositionStore from '../../store/PositionStore';
import { mapLayerShape } from '../../store/MapLayerStore';
import MapLayersDialogContent from './MapLayersDialogContent';
import MenuDrawer from '../MenuDrawer';
import withBreakpoint from '../../../utils/client/withBreakpoint';
import { useConfigContext } from '../../client/ConfigContext';

const onlyUpdateCoordChanges = (prevProps, nextProps) =>
  prevProps.lat === nextProps.lat &&
  prevProps.lon === nextProps.lon &&
  prevProps.zoom === nextProps.zoom &&
  prevProps.bounds === nextProps.bounds &&
  prevProps.mapTracking === nextProps.mapTracking &&
  prevProps.mapLayers === nextProps.mapLayers &&
  prevProps.children === nextProps.children &&
  prevProps.leafletObjs === nextProps.leafletObjs &&
  prevProps.bottomButtons === nextProps.bottomButtons &&
  prevProps.topButtons === nextProps.topButtons;

const MapCont = memo(MapContainer, onlyUpdateCoordChanges);

export const getForcedLayersFromMapLayerOptions = mapLayerOptions => {
  const forcedLayers = {};
  Object.keys(mapLayerOptions).forEach(key => {
    const layer = mapLayerOptions[key];
    if (layer?.isLocked === undefined) {
      Object.keys(layer).forEach(subKey => {
        if (layer[subKey].isLocked) {
          if (!forcedLayers[key]) {
            forcedLayers[key] = {};
          }
          forcedLayers[key][subKey] = layer[subKey].isSelected;
        }
      });
    } else if (layer?.isLocked) {
      forcedLayers[key] = layer.isSelected;
    }
  });
  return forcedLayers;
};

function MapWithTrackingStateHandler(
  {
    lat,
    lon,
    zoom,
    position,
    bounds,
    children,
    renderCustomButtons,
    mapLayers,
    mapLayerOptions = null,
    mapTracking,
    locationPopup,
    onSelectLocation = () => null,
    onStartNavigation,
    onEndNavigation,
    onMapTracking,
    setMWTRef,
    mapRef,
    // eslint-disable-next-line react/prop-types
    leafletEvents = {},
    breakpoint,
    topButtons = null,
    ...rest
  },
  context,
) {
  const config = useConfigContext();
  const intl = useIntl();
  const [mapTrackingState, setMapTrackingState] = useState(mapTracking);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mutable, render-time-only bookkeeping that previously lived on the class
  // instance. These do not need to trigger re-renders when changed.
  const naviProps = useRef({}).current;
  const mounted = useRef(false);
  const mapElement = useRef(null);
  const ignoreNavigation = useRef(false);
  const refresh = useRef(false);
  const oldBounds = useRef(undefined);
  const oldLat = useRef(undefined);
  const oldLon = useRef(undefined);
  const navigated = useRef(false);

  const setMapElementRef = element => {
    if (element && mapElement.current !== element && mounted.current) {
      mapElement.current = element;
      if (mapRef) {
        mapRef(element);
      }
    }
  };

  const disableMapTracking = () => {
    if (!mounted.current) {
      return;
    }
    setMapTrackingState(false);
  };

  const enableMapTracking = () => {
    if (!position.hasLocation) {
      context.executeAction(startLocationWatch);
    }
    if (!mapTrackingState) {
      // enabling tracking will trigger same navigation events as user navigation
      // this hack prevents those events from clearing tracking
      ignoreNavigation.current = true;
      setTimeout(() => {
        ignoreNavigation.current = false;
      }, 500);
      setMapTrackingState(true);
    }
    if (onMapTracking) {
      onMapTracking();
    }
  };

  // this is used outside of this component
  const forceRefresh = () => {
    refresh.current = true;
  };

  const startNavigation = e => {
    if (onStartNavigation) {
      onStartNavigation(mapElement.current, e);
    }
    if (mapTrackingState && !ignoreNavigation.current) {
      disableMapTracking();
    }
  };

  const endNavigation = e => {
    if (onEndNavigation) {
      onEndNavigation(mapElement.current, e);
    }
    navigated.current = true;
  };

  const toggleSettingsOpen = () => {
    setSettingsOpen(prev => !prev);
  };

  const getMapLayers = () => {
    let forcedLayers;
    if (mapLayerOptions) {
      forcedLayers = getForcedLayersFromMapLayerOptions(mapLayerOptions);
    }
    if (isEmpty(forcedLayers)) {
      return mapLayers;
    }
    const merged = {
      ...mapLayers,
      ...forcedLayers,
      vehicles: !mapLayerOptions ? mapLayers.vehicles : false,
    };
    if (isEmpty(forcedLayers.stop)) {
      return merged;
    }
    return {
      ...merged,
      stop: {
        ...mapLayers.stop,
        ...forcedLayers.stop,
      },
    };
  };

  // Exposed to the parent via setMWTRef as a stable object reference, whose
  // methods are refreshed on every render below so callers always invoke the
  // latest closures (e.g. reading the current position/mapTrackingState)
  // instead of the ones captured when setMWTRef was first called.
  const exposedInstance = useRef({}).current;
  exposedInstance.enableMapTracking = enableMapTracking;
  exposedInstance.disableMapTracking = disableMapTracking;
  exposedInstance.forceRefresh = forceRefresh;

  useEffect(() => {
    mounted.current = true;
    if (setMWTRef) {
      setMWTRef(exposedInstance);
    }
    return () => {
      mounted.current = false;
    };
    // Runs only once, mirroring componentDidMount/componentWillUnmount.
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (
      mapTracking !== undefined &&
      mapTracking !== mapTrackingState &&
      mounted.current
    ) {
      setMapTrackingState(mapTracking);
    }
    // eslint-disable-next-line
  }, [mapTracking]);

  const btnClassName = 'map-with-tracking-buttons';
  // eslint-disable-next-line no-underscore-dangle
  const currentZoom = mapElement.current?.leafletElement?._zoom || zoom || 16;

  if (mapTrackingState && position.hasLocation) {
    naviProps.lat = position.lat;
    naviProps.lon = position.lon;
    if (zoom) {
      naviProps.zoom = zoom;
    } else if (!naviProps.zoom) {
      naviProps.zoom = currentZoom;
    }
    if (navigated.current) {
      // force map update by changing the coordinate slightly. looks crazy but is the easiest way
      naviProps.lat += 0.000001 * Math.random();
      navigated.current = false;
    }
    delete naviProps.bounds;
  } else if (
    bounds &&
    (!isEqual(oldBounds.current, bounds) || refresh.current)
  ) {
    naviProps.bounds = cloneDeep(bounds);
    delete naviProps.zoom;
    if (refresh.current) {
      // bounds is defined by [min, max] point pair. Substract min lat a bit
      naviProps.bounds[0][0] -= 0.000001 * Math.random();
    }
    oldBounds.current = cloneDeep(bounds);
  } else if (
    lat &&
    lon &&
    ((lat !== oldLat.current && lon !== oldLon.current) || refresh.current)
  ) {
    naviProps.lat = lat;
    if (refresh.current) {
      naviProps.lat += 0.000001 * Math.random();
    }
    naviProps.lon = lon;
    oldLat.current = lat;
    oldLon.current = lon;
    if (zoom) {
      naviProps.zoom = zoom;
    }
    delete naviProps.bounds;
  }
  refresh.current = false;

  let img;
  let color;
  if (position.locationingFailed) {
    img = 'icon-tracking-off';
    color = '#888';
  } else {
    img = 'icon-tracking';
    color = mapTrackingState ? '#007ac9' : '#78909c';
  }
  // eslint-disable-next-line no-nested-ternary
  const ariaLabel = position.locationingFailed
    ? intl.formatMessage({ id: 'tracking-button-offline' })
    : mapTrackingState
      ? intl.formatMessage({ id: 'tracking-button-on' })
      : intl.formatMessage({ id: 'tracking-button-off' });

  const mergedMapLayers = getMapLayers();
  return (
    <>
      <MapCont
        className="flex-grow"
        locationPopup={locationPopup}
        onSelectLocation={onSelectLocation}
        leafletEvents={{
          ...leafletEvents,
          onDragstart: startNavigation,
          onZoomstart: startNavigation,
          onZoomend: endNavigation,
          onDragend: endNavigation,
        }}
        {...naviProps}
        {...rest}
        leafletMapRef={setMapElementRef}
        breakpoint={breakpoint}
        bottomButtons={
          <div className={btnClassName}>
            {config.map.showLayerSelector && (
              <MapControlButton
                img="icon_map-layers"
                handleClick={toggleSettingsOpen}
                color={config.colors.primary}
                ariaLabel={intl.formatMessage({
                  id: 'maplayers',
                })}
              />
            )}
            {renderCustomButtons && renderCustomButtons()}
            <MapControlButton
              img={img}
              color={color}
              ariaLabel={ariaLabel}
              handleClick={() => {
                if (mapTrackingState) {
                  disableMapTracking();
                } else {
                  enableMapTracking();
                }
              }}
            />
          </div>
        }
        topButtons={topButtons}
        mapLayers={mergedMapLayers}
      >
        {children}
      </MapCont>
      {config.map.showLayerSelector && (
        <MenuDrawer
          open={settingsOpen}
          onRequestChange={toggleSettingsOpen}
          className="offcanvas-layers"
          breakpoint={breakpoint}
        >
          <MapLayersDialogContent
            setOpen={toggleSettingsOpen}
            mapLayerOptions={mapLayerOptions}
            mapLayers={mergedMapLayers}
          />
          <button
            type="button"
            className="desktop-button"
            onClick={toggleSettingsOpen}
          >
            {intl.formatMessage({
              id: 'close',
              defaultMessage: 'Close',
            })}
          </button>
        </MenuDrawer>
      )}
    </>
  );
}

MapWithTrackingStateHandler.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

MapWithTrackingStateHandler.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  zoom: PropTypes.number,
  position: PropTypes.shape({
    hasLocation: PropTypes.bool.isRequired,
    locationingFailed: PropTypes.bool,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  children: PropTypes.arrayOf(PropTypes.node),
  leafletObjs: PropTypes.arrayOf(PropTypes.node),
  renderCustomButtons: PropTypes.func,
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape,
  mapTracking: PropTypes.bool,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
  onStartNavigation: PropTypes.func,
  onEndNavigation: PropTypes.func,
  onMapTracking: PropTypes.func,
  setMWTRef: PropTypes.func,
  mapRef: PropTypes.func,
  // eslint-disable-next-line
  leafletEvents: PropTypes.object,
  breakpoint: PropTypes.string.isRequired,
  topButtons: PropTypes.node,
};

const MapWithTrackingStateHandlerapWithBreakpoint = withBreakpoint(
  MapWithTrackingStateHandler,
);

const MapWithTracking = connectToStores(
  MapWithTrackingStateHandlerapWithBreakpoint,
  [PositionStore],
  ({ getStore }) => ({
    position: getStore(PositionStore).getLocationState(),
  }),
);

export { MapWithTracking as default, MapWithTrackingStateHandler as Component };
