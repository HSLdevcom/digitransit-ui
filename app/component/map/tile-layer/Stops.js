import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';
import {
  drawTerminalIcon,
  drawStopIcon,
  drawHybridStopIcon,
  drawHybridStationIcon,
} from '../../../util/mapIconUtils';
import { ExtendedRouteTypes } from '../../../constants';
import {
  isFeatureLayerEnabled,
  getLayerBaseUrl,
} from '../../../util/mapLayerUtils';
import { PREFIX_ITINERARY_SUMMARY, PREFIX_ROUTES } from '../../../util/path';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

class Stops {
  constructor(tile, config, mapLayers, relayEnvironment, mergeStops) {
    this.tile = tile;
    this.config = config;
    this.mapLayers = mapLayers;
    this.relayEnvironment = relayEnvironment;
    this.mergeStops = mergeStops;
  }

  static getName = () => 'stop';

  drawStop(feature, isHybrid, zoom, minZoom) {
    if (!isFeatureLayerEnabled(feature, Stops.getName(), this.mapLayers)) {
      return;
    }

    // In bbnavi, we don't want selected stops to be highlighted.
    const isHilighted = false;
    /* this.tile.hilightedStops &&
      this.tile.hilightedStops.includes(feature.properties.gtfsId); */

    let hasTrunkRoute = false;
    if (
      feature.properties.type === 'BUS' &&
      this.config.useExtendedRouteTypes
    ) {
      const routes = JSON.parse(feature.properties.routes);
      if (routes.some(p => p.gtfsType === ExtendedRouteTypes.BusExpress)) {
        hasTrunkRoute = true;
      }
    }
    const ignoreMinZoomLevel =
      feature.properties.type === 'FERRY' ||
      feature.properties.type === 'RAIL' ||
      feature.properties.type === 'SUBWAY';
    if (ignoreMinZoomLevel || zoom >= minZoom) {
      if (isHybrid) {
        drawHybridStopIcon(
          this.tile,
          feature.geom,
          isHilighted,
          this.config.colors.iconColors,
          hasTrunkRoute,
        );
        return;
      }

      drawStopIcon(
        this.tile,
        feature.geom,
        hasTrunkRoute ? 'bus-express' : feature.properties.type,
        !isNull(feature.properties.platform)
          ? feature.properties.platform
          : false,
        isHilighted,
        !!(
          feature.properties.type === 'FERRY' &&
          !isNull(feature.properties.code)
        ),
        this.config.colors.iconColors,
      );
    }
  }

  stopsToShowCheck(feature) {
    if (this.tile.stopsToShow) {
      return this.tile.stopsToShow.includes(feature.properties.gtfsId);
    }
    return true;
  }

  isExcludedCarpoolStop = stop => {
    return (
      stop.properties.type === 'CARPOOL' &&
      !stop.properties.name.includes('P+M') &&
      !stop.properties.gtfsId.includes(':mfdz:') &&
      !stop.properties.gtfsId.includes(':bbnavi:')
    );
  };

  shouldRenderTerminalIcon = (mode, path, vehicles) => {
    const modesWithoutIcon = ['SUBWAY'];
    const viewsWithoutIcon = [PREFIX_ITINERARY_SUMMARY];
    const selectedMode = vehicles
      ? Object.values(vehicles)[0]?.mode
      : undefined;
    if (
      modesWithoutIcon.includes(mode) &&
      (viewsWithoutIcon.some(view => path.includes(view)) ||
        (!!selectedMode &&
          modesWithoutIcon.includes(selectedMode.toUpperCase()) &&
          path.includes(PREFIX_ROUTES)))
    ) {
      return false;
    }
    return true;
  };

  getPromise(lang) {
    return fetchWithLanguageAndSubscription(
      `${getLayerBaseUrl(this.config.URL.STOP_MAP, lang)}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
      this.config,
      lang,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));
          this.features = [];

          // draw highlighted stops on lower zoom levels
          const hasHilightedStops = !!(
            this.tile.hilightedStops &&
            this.tile.hilightedStops.length &&
            this.tile.hilightedStops[0]
          );

          if (
            vt.layers.stops != null &&
            (this.tile.coords.z >= this.config.stopsMinZoom ||
              hasHilightedStops)
          ) {
            const featureByCode = {};
            const hybridGtfsIdByCode = {};
            const zoom = this.tile.coords.z + (this.tile.props.zoomOffset || 0);
            const drawPlatforms = this.config.terminalStopsMaxZoom - 1 <= zoom;
            const drawRailPlatforms = this.config.railPlatformsMinZoom <= zoom;
            for (let i = 0, ref = vt.layers.stops.length - 1; i <= ref; i++) {
              const feature = vt.layers.stops.feature(i);
              // FIXME: type is (temporarilly) deduced from gtfsId. Should be returned by OTP
              if (
                !feature.properties.type &&
                (feature.properties.gtfsId.includes(':mfdz:') ||
                  feature.properties.gtfsId.includes(':bbnavi:'))
              ) {
                feature.properties.type = 'CARPOOL';
              }
              if (
                isFeatureLayerEnabled(feature, 'stop', this.mapLayers) &&
                feature.properties.type &&
                (isNull(feature.properties.parentStation) ||
                  drawPlatforms ||
                  (feature.properties.type === 'RAIL' && drawRailPlatforms))
              ) {
                [[feature.geom]] = feature.loadGeometry();
                const f = pick(feature, ['geom', 'properties']);

                if (
                  // if under zoom level limit, only draw highlighted stops on near you page
                  this.tile.coords.z < this.config.stopsMinZoom &&
                  !(
                    hasHilightedStops &&
                    this.tile.hilightedStops.includes(f.properties.gtfsId)
                  )
                ) {
                  continue; // eslint-disable-line no-continue
                }
                if (
                  f.properties.code &&
                  this.mergeStops &&
                  this.config.mergeStopsByCode
                ) {
                  /* a stop may be represented multiple times in data, once for each transport mode
                     Latest stop erares underlying ones unless the stop marker size is adjusted accordingly.
                     Currently we expand the first marker so that double stops are visialized nicely.
                   */
                  const prevFeature = featureByCode[f.properties.code];
                  if (!prevFeature) {
                    featureByCode[f.properties.code] = f;
                  } else if (
                    this.config.mergeStopsByCode &&
                    f.properties.code &&
                    prevFeature.properties.type !== 'CARPOOL' &&
                    f.properties.type !== 'CARPOOL' &&
                    prevFeature.properties.type !== f.properties.type &&
                    f.geom.x === prevFeature.geom.x &&
                    f.geom.y === prevFeature.geom.y
                  ) {
                    // save only one gtfsId per hybrid stop, always save the gtfsId for the bus stop to fetch extended route types
                    const featWithBus =
                      prevFeature.properties.type === 'BUS' ? prevFeature : f;
                    const featWithoutBus =
                      prevFeature.properties.type === 'BUS' ? f : prevFeature;
                    hybridGtfsIdByCode[featWithBus.properties.code] =
                      featWithBus.properties.gtfsId;
                    // Also change hilighted stopId to the stop with type = BUS in hybrid stop cases
                    if (
                      this.tile.hilightedStops &&
                      this.tile.hilightedStops.includes(
                        featWithoutBus.properties.gtfsId,
                      )
                    ) {
                      this.tile.hilightedStops = [
                        featWithBus.properties.gtfsId,
                      ];
                    }
                  }
                }
                if (this.stopsToShowCheck(f)) {
                  this.features.push(f);
                }
              }
            }
            // sort to draw in correct order
            this.features
              .sort((a, b) => a.geom.y - b.geom.y)
              .forEach(f => {
                /* Note: don't expand separate stops sharing the same code,
                 unless type is different and location actually overlaps. */
                const hybridId = hybridGtfsIdByCode[f.properties.code];
                const isNotAHybridStop =
                  !hybridId || hybridId === f.properties.gtfsId;
                const isNotAnExcludedCarpoolStop = !this.isExcludedCarpoolStop(
                  f,
                );
                if (isNotAHybridStop && isNotAnExcludedCarpoolStop) {
                  this.drawStop(
                    f,
                    !!hybridId,
                    this.tile.coords.z,
                    this.config.stopsMinZoom,
                  );
                }
              });
          }
          if (
            vt.layers.stations != null &&
            this.config.terminalStopsMaxZoom >
              this.tile.coords.z + (this.tile.props.zoomOffset || 0)
          ) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              const featureTypes = feature.properties.type.split(',');
              const isHybridStation = featureTypes.length > 1;
              if (
                feature.properties.type &&
                isFeatureLayerEnabled(
                  feature,
                  'terminal',
                  this.mapLayers,
                  isHybridStation,
                ) &&
                this.stopsToShowCheck(feature)
              ) {
                [[feature.geom]] = feature.loadGeometry();
                const isHilighted =
                  this.tile.hilightedStops &&
                  this.tile.hilightedStops.includes(feature.properties.gtfsId);
                this.features.unshift(pick(feature, ['geom', 'properties']));
                if (
                  isHybridStation &&
                  (isHilighted ||
                    this.tile.coords.z >= this.config.terminalStopsMinZoom)
                ) {
                  drawHybridStationIcon(
                    this.tile,
                    feature.geom,
                    isHilighted,
                    this.config.colors.iconColors,
                  );
                }
                if (
                  !isHybridStation &&
                  (isHilighted ||
                    this.tile.coords.z >= this.config.terminalStopsMinZoom) &&
                  this.shouldRenderTerminalIcon(
                    feature.properties.type,
                    window.location.pathname,
                    this.tile?.vehicles,
                  )
                ) {
                  drawTerminalIcon(
                    this.tile,
                    feature.geom,
                    feature.properties.type,
                    isHilighted,
                  );
                }
              }
            }
          }
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }
}

export default Stops;
