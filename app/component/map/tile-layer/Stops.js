import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';
import { graphql, fetchQuery } from 'react-relay';
import { DateTime } from 'luxon';
import {
  drawTerminalIcon,
  drawStopIcon,
  drawHybridStopIcon,
  drawHybridStationIcon,
} from '../../../util/mapIconUtils';
import { getStopMode } from '../../../util/modeUtils';
import {
  isFeatureLayerEnabled,
  getLayerBaseUrl,
} from '../../../util/mapLayerUtils';
import { PREFIX_ITINERARY_SUMMARY, PREFIX_ROUTES } from '../../../util/path';
import { splitGtfsId } from '../../../util/gtfs';
import { fetchWithLanguageAndSubscription } from '../../../util/fetchUtils';
import getStopStatus, {
  combineStopStatuses,
} from '../../../util/stopStatusUtils';

const stopAlertsQuery = graphql`
  query StopsQuery($stopId: String!, $date: String!) {
    stop: stop(id: $stopId) {
      gtfsId
      alerts: alerts(types: [STOP]) {
        alertEffect
      }
      stoptimes: stoptimesForServiceDate(date: $date, omitCanceled: false) {
        stoptimes {
          serviceDay
        }
      }
    }
  }
`;

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

function getStopStatusForProperties(properties, showStopStatusMarkers) {
  return getStopStatus({
    showStopStatusMarkers,
    closedByServiceAlert: properties.closedByServiceAlert,
    servicesRunningOnServiceDate: properties.servicesRunningOnServiceDate,
    servicesRunningInFuture: properties.servicesRunningInFuture,
    alertSeverityLevel: properties.alertSeverityLevel,
  });
}

const shouldRenderTerminalIcon = (mode, path, vehicles) => {
  const modesWithoutIcon = ['SUBWAY'];
  const viewsWithoutIcon = [PREFIX_ITINERARY_SUMMARY];
  const selectedMode = vehicles ? Object.values(vehicles)[0]?.mode : undefined;
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
    const isHighlighted = !!this.tile.highlightedStops?.includes(
      feature.properties.gtfsId,
    );

    const routes = JSON.parse(feature.properties.routes);
    const mode = getStopMode(
      feature.properties.type,
      routes,
      feature.properties.code,
      this.config,
    );

    const ignoreMinZoomLevel =
      feature.properties.type === 'FERRY' ||
      feature.properties.type === 'RAIL' ||
      feature.properties.type === 'SUBWAY';
    if (ignoreMinZoomLevel || zoom >= minZoom) {
      if (isHybrid) {
        const ownStatus = getStopStatusForProperties(
          feature.properties,
          this.config.showStopStatusMarkers,
        );
        const sibling = feature.hybridSiblingProperties;
        const siblingStatus = sibling
          ? getStopStatusForProperties(
              sibling,
              this.config.showStopStatusMarkers,
            )
          : null;
        return drawHybridStopIcon(
          this.tile,
          feature.geom,
          isHighlighted,
          this.config,
          mode === 'bus-express',
          combineStopStatuses(ownStatus, siblingStatus),
        );
      }
      const stopStatus = getStopStatusForProperties(
        feature.properties,
        this.config.showStopStatusMarkers,
      );
      if (isHighlighted && zoom <= minZoom) {
        // Fetch stop details only when stop is highlighted and realtime layer is not used (zoom level).
        this.drawHighlighted(feature, mode, isHighlighted, stopStatus);
        return Promise.resolve();
      }
      return drawStopIcon(
        this.tile,
        feature.geom,
        mode,
        !isNull(feature.properties.platform)
          ? feature.properties.platform
          : false,
        isHighlighted,
        !!(
          feature.properties.type === 'FERRY' &&
          this.config.externalFerryByStopCode &&
          !isNull(feature.properties.code)
        ),
        this.config,
        stopStatus,
      );
    }
    return Promise.resolve();
  }

  stopsToShowCheck(feature, isStation) {
    const { feedId } = splitGtfsId(feature.properties.gtfsId);
    if (!isStation && !this.config.feedIds.includes(feedId)) {
      return false;
    }
    if (this.tile.stopsToShow) {
      return this.tile.stopsToShow.includes(feature.properties.gtfsId);
    }
    return true;
  }

  getPromise(lang) {
    const zoomWithOffset =
      this.tile.coords.z + (this.tile.props.zoomOffset || 0);
    const stopsUrl =
      zoomWithOffset >= this.config.stopsMinZoom
        ? this.config.URL.REALTIME_STOP_MAP
        : this.config.URL.STOP_MAP;
    return fetchWithLanguageAndSubscription(
      `${getLayerBaseUrl(stopsUrl, lang)}${zoomWithOffset}/${
        this.tile.coords.x
      }/${this.tile.coords.y}.pbf`,
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
          this.highlightedStationEntries = [];

          // draw highlighted stops on lower zoom levels
          const hasHighlightedStops = !!this.tile.highlightedStops?.length;
          const stopLayer = vt.layers.stops || vt.layers.realtimeStops;
          // Sequential draw chain returned so TileContainer waits for all
          // badge draws before calling drawHighlightedOnTop().
          let drawChain = Promise.resolve();

          if (
            stopLayer != null &&
            (this.tile.coords.z >= this.config.stopsMinZoom ||
              hasHighlightedStops)
          ) {
            const featureByCode = {};
            const hybridGtfsIdByCode = {};
            const drawPlatforms =
              this.config.terminalStopsMaxZoom - 1 <= zoomWithOffset;
            const drawRailPlatforms =
              this.config.railPlatformsMinZoom <= zoomWithOffset;
            for (let i = 0, ref = stopLayer.length - 1; i <= ref; i++) {
              const feature = stopLayer.feature(i);
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
                  !this.tile.highlightedStops?.includes(f.properties.gtfsId)
                ) {
                  continue; // eslint-disable-line no-continue
                }
                if (
                  f.properties.code &&
                  this.mergeStops &&
                  this.config.mergeStopsByCode
                ) {
                  /* a stop may be represented multiple times in data, once for each transport mode.
                     The latest stop erases underlying ones unless the stop marker size is adjusted accordingly.
                     Currently we expand the first marker so that double stops are visualized nicely.
                   */
                  const prevFeature = featureByCode[f.properties.code];
                  if (!prevFeature) {
                    featureByCode[f.properties.code] = f;
                  } else if (
                    this.config.mergeStopsByCode &&
                    f.properties.code &&
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
                    // remember the sibling stop's properties so the shared
                    // hybrid icon can combine both stops' statuses
                    featWithBus.hybridSiblingProperties =
                      featWithoutBus.properties;
                    featWithoutBus.hybridSiblingProperties =
                      featWithBus.properties;
                    // Also change highlighted stopId to the stop with type = BUS in hybrid stop cases
                    if (
                      this.tile.highlightedStops?.includes(
                        featWithoutBus.properties.gtfsId,
                      )
                    ) {
                      this.tile.highlightedStops = [
                        featWithBus.properties.gtfsId,
                      ];
                    }
                  }
                }
                if (this.stopsToShowCheck(f, false)) {
                  this.features.push(f);
                }
              }
            }
            // Non-highlighted stops drawn sequentially (top-to-bottom) so each
            // stop's badge completes before the next icon starts; highlighted stops
            // are deferred to drawHighlightedOnTop() so they always paint last.
            // Built after the feature loop because highlightedStops may be mutated (hybrid stop swap).
            const highlightedSet = new Set(this.tile.highlightedStops || []);
            const highlightedEntries = [];

            this.features
              .sort((a, b) => {
                const aHighlighted = highlightedSet.has(a.properties.gtfsId)
                  ? 1
                  : 0;
                const bHighlighted = highlightedSet.has(b.properties.gtfsId)
                  ? 1
                  : 0;
                if (aHighlighted !== bHighlighted) {
                  return aHighlighted - bHighlighted;
                }
                return a.geom.y - b.geom.y;
              })
              .forEach(f => {
                /* Note: don't expand separate stops sharing the same code,
                 unless type is different and location actually overlaps. */
                const hybridId = hybridGtfsIdByCode[f.properties.code];
                if (!hybridId || hybridId === f.properties.gtfsId) {
                  if (highlightedSet.has(f.properties.gtfsId)) {
                    highlightedEntries.push({ f, hybridId });
                  } else {
                    const { coords } = this.tile;
                    const { stopsMinZoom } = this.config;
                    drawChain = drawChain.then(() =>
                      this.drawStop(f, !!hybridId, coords.z, stopsMinZoom),
                    );
                  }
                }
              });

            this.highlightedEntries = highlightedEntries;
          }
          if (
            vt.layers.stations != null &&
            this.config.terminalStopsMaxZoom > zoomWithOffset
          ) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              const featureTypes = feature.properties.type.split(',');
              const isHybridStation = featureTypes.length > 1 && false; // disable until we get proper icon
              if (
                feature.properties.type &&
                isFeatureLayerEnabled(
                  feature,
                  'terminal',
                  this.mapLayers,
                  isHybridStation,
                ) &&
                this.stopsToShowCheck(feature, true)
              ) {
                [[feature.geom]] = feature.loadGeometry();
                const isHighlighted = !!this.tile.highlightedStops?.includes(
                  feature.properties.gtfsId,
                );
                this.features.unshift(pick(feature, ['geom', 'properties']));
                if (
                  isHybridStation &&
                  (isHighlighted ||
                    this.tile.coords.z >= this.config.terminalStopsMinZoom)
                ) {
                  const { geom } = feature;
                  if (isHighlighted) {
                    this.highlightedStationEntries.push({
                      geom,
                      isHybrid: true,
                    });
                  } else {
                    drawChain = drawChain.then(() =>
                      drawHybridStationIcon(
                        this.tile,
                        geom,
                        false,
                        this.config,
                      ),
                    );
                  }
                }
                if (
                  !isHybridStation &&
                  (isHighlighted ||
                    this.tile.coords.z >= this.config.terminalStopsMinZoom) &&
                  shouldRenderTerminalIcon(
                    feature.properties.type,
                    window.location.pathname,
                    this.tile?.vehicles,
                  )
                ) {
                  const routes = JSON.parse(feature.properties.routes);
                  const mode = getStopMode(
                    feature.properties.type,
                    routes,
                    undefined, // terminal has no stop code
                    this.config,
                    true,
                  );
                  const { geom } = feature;
                  if (isHighlighted) {
                    this.highlightedStationEntries.push({ geom, mode });
                  } else {
                    drawChain = drawChain.then(() =>
                      drawTerminalIcon(
                        this.tile,
                        geom,
                        mode,
                        false,
                        this.config,
                      ),
                    );
                  }
                }
              }
            }
          }
          return drawChain;
        },
        err => console.log(err), // eslint-disable-line no-console
      );
    });
  }

  drawHighlightedOnTop() {
    const stopChain = this.highlightedEntries?.length
      ? this.highlightedEntries.reduce(
          (chain, { f, hybridId }) =>
            chain.then(() =>
              this.drawStop(
                f,
                !!hybridId,
                this.tile.coords.z,
                this.config.stopsMinZoom,
              ),
            ),
          Promise.resolve(),
        )
      : Promise.resolve();
    return this.highlightedStationEntries?.length
      ? this.highlightedStationEntries.reduce(
          (chain, { geom, mode, isHybrid }) =>
            chain.then(() =>
              isHybrid
                ? drawHybridStationIcon(this.tile, geom, true, this.config)
                : drawTerminalIcon(this.tile, geom, mode, true, this.config),
            ),
          stopChain,
        )
      : stopChain;
  }

  drawHighlighted = (feature, mode, isHighlighted, stopStatus) => {
    const date = DateTime.now();
    const callback = ({ stop: result }) => {
      if (result) {
        drawStopIcon(
          this.tile,
          feature.geom,
          mode,
          !isNull(feature.properties.platform)
            ? feature.properties.platform
            : false,
          isHighlighted,
          !!(
            feature.properties.type === 'FERRY' &&
            this.config.externalFerryByStopCode &&
            !isNull(feature.properties.code)
          ),
          this.config,
          stopStatus,
        );
      }
      return this;
    };

    fetchQuery(
      this.relayEnvironment,
      stopAlertsQuery,
      { stopId: feature.properties.gtfsId, date },
      { force: true },
    )
      .toPromise()
      .then(callback);
  };
}

export default Stops;
