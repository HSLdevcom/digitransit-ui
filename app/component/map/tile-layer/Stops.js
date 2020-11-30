import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';

import {
  drawTerminalIcon,
  drawStopIcon,
  drawHybridStopIcon,
} from '../../../util/mapIconUtils';
import { isFeatureLayerEnabled } from '../../../util/mapLayerUtils';

class Stops {
  constructor(
    tile,
    config,
    mapLayers,
    stopsNearYouMode,
    relayEnvironment,
    getCurrentTime = () => new Date().getTime(),
  ) {
    this.tile = tile;
    this.config = config;
    this.mapLayers = mapLayers;
    this.stopsNearYouMode = stopsNearYouMode;
    this.promise = this.getPromise();
    this.getCurrentTime = getCurrentTime;
    this.relayEnvironment = relayEnvironment;
  }

  static getName = () => 'stop';

  drawStop(feature, isHybrid) {
    const isHilighted =
      this.tile.hilightedStops &&
      this.tile.hilightedStops.includes(feature.properties.gtfsId);
    if (
      !isFeatureLayerEnabled(
        feature,
        Stops.getName(),
        this.mapLayers,
        this.config,
      )
    ) {
      return;
    }
    if (isHybrid) {
      drawHybridStopIcon(this.tile, feature.geom, isHilighted);
      return;
    }

    drawStopIcon(
      this.tile,
      feature.geom,
      feature.properties.type,
      feature.properties.platform !== 'null'
        ? feature.properties.platform
        : false,
      isHilighted,
    );
  }

  stopsNearYouCheck(feature) {
    if (!this.stopsNearYouMode) {
      return true;
    }
    return feature.properties.type === this.stopsNearYouMode;
  }

  isExcludedCarpoolStop = stop => {
    return (
      stop.properties.type === 'CARPOOL' &&
      !stop.properties.name.includes('P+M')
    );
  };

  getPromise() {
    return fetch(
      `${this.config.URL.STOP_MAP}${
        this.tile.coords.z + (this.tile.props.zoomOffset || 0)
      }/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          if (
            vt.layers.stops != null &&
            this.tile.coords.z >= this.config.stopsMinZoom
          ) {
            const featureByCode = {};
            const hybridGtfsIdByCode = {};
            const zoom = this.tile.coords.z + (this.tile.props.zoomOffset || 0);
            const drawPlatforms = this.config.terminalStopsMaxZoom - 1 <= zoom;
            const drawRailPlatforms = this.config.railPlatformsMinZoom <= zoom;
            for (let i = 0, ref = vt.layers.stops.length - 1; i <= ref; i++) {
              const feature = vt.layers.stops.feature(i);
              if (
                feature.properties.type &&
                (feature.properties.parentStation === 'null' ||
                  drawPlatforms ||
                  (feature.properties.type === 'RAIL' && drawRailPlatforms))
              ) {
                [[feature.geom]] = feature.loadGeometry();
                const f = pick(feature, ['geom', 'properties']);
                if (
                  f.properties.code &&
                  this.config.mergeStopsByCode &&
                  !this.stopsNearYouMode
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
                    // save only one gtfsId per hybrid stop
                    hybridGtfsIdByCode[f.properties.code] = f.properties.gtfsId;
                    // Also change hilighted stopId in hybrid stop cases
                    if (
                      this.tile.hilightedStops &&
                      this.tile.hilightedStops.includes(
                        prevFeature.properties.gtfsId,
                      )
                    ) {
                      this.tile.hilightedStops = [f.properties.gtfsId];
                    }
                  }
                }
                if (this.stopsNearYouCheck(f)) {
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
                  this.drawStop(f, !!hybridId);
                }
              });
          }
          if (
            vt.layers.stations != null &&
            this.config.terminalStopsMaxZoom >
              this.tile.coords.z + (this.tile.props.zoomOffset || 0) &&
            this.tile.coords.z >= this.config.terminalStopsMinZoom
          ) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              if (
                feature.properties.type &&
                isFeatureLayerEnabled(
                  feature,
                  'terminal',
                  this.mapLayers,
                  this.config,
                ) &&
                this.stopsNearYouCheck(feature)
              ) {
                [[feature.geom]] = feature.loadGeometry();
                this.features.unshift(pick(feature, ['geom', 'properties']));
                drawTerminalIcon(
                  this.tile,
                  feature.geom,
                  feature.properties.type,
                );
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
