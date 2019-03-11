import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import pick from 'lodash/pick';
import Relay from 'react-relay/classic';

import { getMaximumAlertSeverityLevel } from '../../../util/alertUtils';
import {
  drawRoundIcon,
  drawTerminalIcon,
  drawRoundIconAlertBadge,
} from '../../../util/mapIconUtils';
import { isFeatureLayerEnabled } from '../../../util/mapLayerUtils';

/**
 * The period of time, in ms, to have the results cached.
 */
const CACHE_PERIOD_MS = 1000 * 60 * 5; // 5 minutes
const cache = {};

class Stops {
  constructor(
    tile,
    config,
    mapLayers,
    getCurrentTime = () => new Date().getTime(),
  ) {
    this.tile = tile;
    this.config = config;
    this.mapLayers = mapLayers;
    this.promise = this.getPromise();
    this.getCurrentTime = getCurrentTime;
  }

  static getName = () => 'stop';

  drawStop(feature, alertSeverityLevel = undefined) {
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

    if (feature.properties.type === 'FERRY') {
      drawTerminalIcon(
        this.tile,
        feature.geom,
        feature.properties.type,
        this.tile.coords.z >= this.config.terminalNamesZoom
          ? feature.properties.name
          : false,
      );
      return;
    }

    const { iconRadius } = drawRoundIcon(
      this.tile,
      feature.geom,
      feature.properties.type,
      this.tile.props.hilightedStops &&
        this.tile.props.hilightedStops.includes(feature.properties.gtfsId),
      feature.properties.platform !== 'null'
        ? feature.properties.platform
        : false,
    );

    if (alertSeverityLevel) {
      drawRoundIconAlertBadge(
        this.tile,
        feature.geom,
        iconRadius,
        alertSeverityLevel,
      );
    }
  }

  fetchStatusAndDrawStop = stopFeature => {
    const { gtfsId } = stopFeature.properties;
    const query = Relay.createQuery(
      Relay.QL`
        query StopStatus($id: String!) {
          stop(id: $id) {
            alerts {
              alertSeverityLevel
            }
          }
        }
      `,
      { id: gtfsId },
    );

    const currentTime = this.getCurrentTime();
    const callback = readyState => {
      if (!readyState.done) {
        return;
      }
      const result = Relay.Store.readQuery(query)[0];
      if (!result) {
        return;
      }
      cache[gtfsId] = currentTime;
      this.drawStop(stopFeature, getMaximumAlertSeverityLevel(result.alerts));
    };

    const latestFetchTime = cache[gtfsId];
    if (latestFetchTime && latestFetchTime - currentTime < CACHE_PERIOD_MS) {
      Relay.Store.primeCache({ query }, callback);
    } else {
      Relay.Store.forceFetch({ query }, callback);
    }
  };

  getPromise() {
    return fetch(
      `${this.config.URL.STOP_MAP}${this.tile.coords.z +
        (this.tile.props.zoomOffset || 0)}` +
        `/${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
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
            for (let i = 0, ref = vt.layers.stops.length - 1; i <= ref; i++) {
              const feature = vt.layers.stops.feature(i);
              if (
                feature.properties.type &&
                (feature.properties.parentStation === 'null' ||
                  this.config.terminalStopsMaxZoom - 1 <=
                    this.tile.coords.z + (this.tile.props.zoomOffset || 0))
              ) {
                [[feature.geom]] = feature.loadGeometry();
                this.features.push(pick(feature, ['geom', 'properties']));
                this.fetchStatusAndDrawStop(feature);
              }
            }
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
                )
              ) {
                [[feature.geom]] = feature.loadGeometry();
                this.features.unshift(pick(feature, ['geom', 'properties']));
                drawTerminalIcon(
                  this.tile,
                  feature.geom,
                  feature.properties.type,
                  this.tile.coords.z >= this.config.terminalNamesZoom
                    ? feature.properties.name
                    : false,
                );
              }
            }
          }
        },
        err => console.log(err),
      );
    });
  }
}

export default Stops;
