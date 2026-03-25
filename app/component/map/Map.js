import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import LeafletMap from 'react-leaflet/es/Map';
import TileLayer from 'react-leaflet/es/TileLayer';
import AttributionControl from 'react-leaflet/es/AttributionControl';
import ScaleControl from 'react-leaflet/es/ScaleControl';
import ZoomControl from 'react-leaflet/es/ZoomControl';
import { intlShape } from 'react-intl';
import L from 'leaflet';
import get from 'lodash/get';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import { configShape } from '../../util/shapes';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import PositionMarker from './PositionMarker';
import VectorTileLayerContainer from './tile-layer/VectorTileLayerContainer';
import { boundWithMinimumArea } from '../../util/geo-utils';
import events from '../../util/events';
import { getLayerBaseUrl } from '../../util/mapLayerUtils';
import GeoJSON from './GeoJSON';
import { mapLayerShape } from '../../store/MapLayerStore';

const zoomOutText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_minus"/></svg>`;
const zoomInText = `<svg class="icon"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon_plus"/></svg>`;
const EXTRA_PADDING = 100;

const startClient = context => {
  const { realTime } = context.config;
  let feedId;
  /* handle multiple feedid case */
  context.config.feedIds.forEach(f => {
    if (!feedId && realTime[f]) {
      feedId = f;
    }
  });
  const source = feedId && realTime[feedId];
  if (source && source.active) {
    const config = {
      ...source,
      feedId,
      options: context.config.feedIds
        .filter(f => realTime[f]?.active)
        .map(f => ({ feedId: f })),
    };
    context.executeAction(startRealTimeClient, config);
  }
};

const onPopupopen = () => events.emit('popupOpened');

export default function Map(
  {
    animate,
    lat,
    lon,
    zoom,
    bounds,
    leafletEvents,
    leafletObjs,
    leafletMapRef,
    mapLayerRef,
    bottomPadding,
    bottomButtons,
    topButtons,
    geoJson,
    mapLayers,
    breakpoint,
    locationPopup,
    onSelectLocation,
    ...rest
  },
  context,
) {
  const { config, intl } = context;

  const [ownZoom, setOwnZoom] = useState(14);
  const boundsOptions = useRef();
  const map = useRef();
  const ready = useRef();

  const updateZoom = () => {
    // eslint-disable-next-line no-underscore-dangle
    const z = map.current?.leafletElement?._zoom || zoom || 16;
    if (z !== ownZoom) {
      setOwnZoom(z);
    }
  };

  useEffect(() => {
    if (breakpoint !== 'large') {
      boundsOptions.current = {
        paddingTopLeft: [0, EXTRA_PADDING],
        paddingBottomRight: [0, (window.innerHeight - 64) / 2],
      };
    }
    updateZoom();
  }, []);

  useEffect(() => {
    updateZoom();
    if (mapLayers.vehicles) {
      startClient(context);
    } else {
      const { client } = context.getStore('RealTimeInformationStore');
      if (client) {
        context.executeAction(stopRealTimeClient, client);
      }
    }
    return () => {
      const { client } = context.getStore('RealTimeInformationStore');
      if (client) {
        context.executeAction(stopRealTimeClient, client);
      }
    };
  }, [mapLayers.vehicles]);

  useEffect(() => {
    // move leaflet attribution control elements according to given padding
    // leaflet api doesn't allow controlling element position so have to use this hack
    if (bottomPadding !== undefined) {
      const bottomControls = document.getElementsByClassName('leaflet-bottom');
      Array.prototype.forEach.call(bottomControls, elem => {
        // eslint-disable-next-line no-param-reassign
        elem.style.transform = `translate(0, -${bottomPadding}px)`;
      });
    }
  }, [bottomPadding]);

  const zoomEnd = () => {
    leafletEvents?.onZoomend?.(); // pass event to parent
    updateZoom();
  };

  const naviProps = {}; // these define map center and zoom
  if (bottomPadding !== undefined && boundsOptions.current) {
    boundsOptions.current.paddingBottomRight = [
      0,
      Math.min(bottomPadding + EXTRA_PADDING, window.innerHeight - 60),
    ];
  }
  if (bounds) {
    // bounds overrule center & zoom
    naviProps.bounds = boundWithMinimumArea(bounds); // validate
  } else if (lat && lon) {
    if (boundsOptions.current?.paddingBottomRight !== undefined) {
      // bounds fitting can take account the wanted padding, so convert to bounds
      naviProps.bounds = boundWithMinimumArea([[lat, lon]], zoom);
    } else {
      naviProps.center = [lat, lon];
      if (zoom) {
        naviProps.zoom = zoom;
      }
    }
  }

  // When this option is set, the map restricts the view to the given geographical bounds,
  // bouncing the user back if the user tries to pan outside the view.
  const mapAreaBounds = L.latLngBounds(
    L.latLng(
      config.map.areaBounds.corner1[0],
      config.map.areaBounds.corner1[1],
    ),
    L.latLng(
      config.map.areaBounds.corner2[0],
      config.map.areaBounds.corner2[1],
    ),
  );
  naviProps.maxBounds = mapAreaBounds;

  if (naviProps.bounds || (naviProps.center && naviProps.zoom)) {
    ready.current = true;
  }

  if (!ready.current) {
    return null;
  }

  const mapBaseUrl = getLayerBaseUrl(config.URL.MAP, config.language);
  const mapUrl = config.hasAPISubscriptionQueryParameter
    ? `${mapBaseUrl}{z}/{x}/{y}{size}.png?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
    : `${mapBaseUrl}{z}/{x}/{y}{size}.png`;

  const leafletObjNew = leafletObjs.concat([
    <VectorTileLayerContainer
      key="vectorTileLayerContainer"
      mapLayers={mapLayers}
      locationPopup={locationPopup}
      onSelectLocation={onSelectLocation}
      {...rest}
    />,
  ]);

  if (mapLayers.vehicles) {
    const useLargeIcon = ownZoom >= config.stopsMinZoom;
    leafletObjNew.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon={useLargeIcon} />,
    );
  }

  let attribution = get(config, 'map.attribution');
  if (!isString(attribution) || isEmpty(attribution)) {
    attribution = false;
  }

  if (geoJson) {
    Object.keys(geoJson)
      .filter(
        key =>
          mapLayers.geoJson[key] !== false &&
          (mapLayers.geoJson[key] === true ||
            geoJson[key].isOffByDefault !== true),
      )
      .forEach((key, i) => {
        leafletObjNew.push(
          <GeoJSON
            key={key.concat(i)}
            data={geoJson[key].data}
            geoJsonZoomLevel={ownZoom}
            locationPopup={locationPopup}
            onSelectLocation={onSelectLocation}
          />,
        );
      });
  }

  return (
    <div ref={mapLayerRef}>
      <span>{topButtons}</span>
      <span
        className="overlay-mover"
        style={{
          transform: `translate(0, -${bottomPadding}px)`,
        }}
      >
        {bottomButtons}
      </span>
      <div aria-hidden="true">
        <LeafletMap
          {...naviProps}
          className={`z${ownZoom}`}
          keyboard={false}
          ref={el => {
            map.current = el;
            if (leafletMapRef) {
              leafletMapRef(el);
            }
          }}
          minZoom={config.map.minZoom}
          maxZoom={config.map.maxZoom}
          zoomControl={false}
          attributionControl={false}
          animate={animate}
          boundsOptions={boundsOptions.current}
          {...leafletEvents}
          onZoomend={zoomEnd}
          onPopupopen={onPopupopen}
          closePopupOnClick={false}
        >
          <TileLayer
            url={mapUrl}
            tileSize={config.map.tileSize || 256}
            zoomOffset={config.map.zoomOffset || 0}
            updateWhenIdle={false}
            size={config.map.useRetinaTiles && L.Browser.retina ? '@2x' : ''}
            minZoom={config.map.minZoom}
            maxZoom={config.map.maxZoom}
            attribution={attribution}
          />
          {attribution && (
            <AttributionControl
              position={breakpoint === 'large' ? 'bottomright' : 'bottomleft'}
              prefix=""
            />
          )}
          {config.map.showScaleBar && (
            <ScaleControl
              imperial={false}
              position={config.map.controls.scale.position}
            />
          )}
          {breakpoint === 'large' && config.map.showZoomControl && (
            <ZoomControl
              position={config.map.controls.zoom.position}
              zoomInText={zoomInText}
              zoomOutText={zoomOutText}
              zoomInTitle={intl.formatMessage({ id: 'map-zoom-in-button' })}
              zoomOutTitle={intl.formatMessage({ id: 'map-zoom-out-button' })}
            />
          )}
          {leafletObjNew}
          <PositionMarker key="position" />
        </LeafletMap>
      </div>
    </div>
  );
}

Map.propTypes = {
  animate: PropTypes.bool,
  lat: PropTypes.number,
  lon: PropTypes.number,
  zoom: PropTypes.number,
  bounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  // eslint-disable-next-line
  leafletEvents: PropTypes.object,
  leafletObjs: PropTypes.arrayOf(PropTypes.node),
  leafletMapRef: PropTypes.func,
  mapLayerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  bottomPadding: PropTypes.number,
  bottomButtons: PropTypes.node,
  topButtons: PropTypes.node,
  // eslint-disable-next-line
  geoJson: PropTypes.object,
  mapLayers: mapLayerShape,
  breakpoint: PropTypes.string,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
};

Map.defaultProps = {
  animate: true,
  mapLayerRef: null,
  leafletMapRef: null,
  lat: undefined,
  lon: undefined,
  zoom: undefined,
  bounds: undefined,
  bottomPadding: undefined,
  bottomButtons: null,
  topButtons: null,
  mapLayers: { geoJson: {} },
  geoJson: undefined,
  leafletEvents: undefined,
  leafletObjs: undefined,
  breakpoint: undefined,
  locationPopup: undefined,
  onSelectLocation: undefined,
};

Map.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func,
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
