import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import { fetchQuery, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import glfun from '@mapbox/mapbox-gl-style-spec/function';
import pick from 'lodash/pick';

import { isBrowser } from '../../../util/browser';
import {
  drawRoundIcon,
  drawCitybikeIcon,
  drawCitybikeNotInUseIcon,
  drawAvailabilityBadge,
} from '../../../util/mapIconUtils';

const getScale = glfun(
  {
    type: 'exponential',
    base: 1,
    stops: [[13, 0.8], [20, 1.6]],
  },
  {},
);

const timeOfLastFetch = {};

const query = graphql`
  query CityBikesQuery($id: String!) {
    station: bikeRentalStation(id: $id) {
      bikesAvailable
      spacesAvailable
    }
  }
`;

class CityBikes {
  constructor(tile, config) {
    this.tile = tile;
    this.config = config;

    this.scaleratio = (isBrowser && window.devicePixelRatio) || 1;
    this.citybikeImageSize =
      16 * this.scaleratio * getScale(this.tile.coords.z);
    this.availabilityImageSize =
      8 * this.scaleratio * getScale(this.tile.coords.z);
    this.notInUseImageSize =
      12 * this.scaleratio * getScale(this.tile.coords.z);

    this.promise = this.fetchWithAction(this.addFeature);
  }

  fetchWithAction = actionFn =>
    fetch(
      `${this.config.URL.CITYBIKE_MAP}` +
        `${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}/` +
        `${this.tile.coords.x}/${this.tile.coords.y}.pbf`,
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(
        buf => {
          const vt = new VectorTile(new Protobuf(buf));

          this.features = [];

          if (vt.layers.stations != null) {
            for (
              let i = 0, ref = vt.layers.stations.length - 1;
              i <= ref;
              i++
            ) {
              const feature = vt.layers.stations.feature(i);
              feature.geom = feature.loadGeometry()[0][0];
              this.features.push(pick(feature, ['geom', 'properties']));
            }
          }

          this.features.forEach(actionFn);
        },
        err => console.log(err),
      );
    });

  fetchAndDrawStatus = feature => {
    const geom = feature.geom;
    const id = feature.properties.id;

    const lastFetch = timeOfLastFetch[id];
    const currentTime = new Date().getTime();

    const callback = ({ station: result }) => {
      timeOfLastFetch[id] = new Date().getTime();

      if (result.bikesAvailable === 0 && result.spacesAvailable === 0) {
        drawCitybikeNotInUseIcon(this.tile, geom, this.notInUseImageSize);
      } else if (
        result.bikesAvailable > this.config.cityBike.fewAvailableCount
      ) {
        drawAvailabilityBadge(
          'good',
          this.tile,
          geom,
          this.citybikeImageSize,
          this.availabilityImageSize,
          this.scaleratio,
        );
      } else if (result.bikesAvailable > 0) {
        drawAvailabilityBadge(
          'poor',
          this.tile,
          geom,
          this.citybikeImageSize,
          this.availabilityImageSize,
          this.scaleratio,
        );
      } else {
        drawAvailabilityBadge(
          'no',
          this.tile,
          geom,
          this.citybikeImageSize,
          this.availabilityImageSize,
          this.scaleratio,
        );
      }
    };

    if (lastFetch && currentTime - lastFetch <= 30000) {
      fetchQuery(Store, query, { id }).then(callback);
    } else {
      fetchQuery(Store, query, { id }, { force: true }).then(callback);
    }
  };

  addFeature = feature => {
    if (this.tile.coords.z <= this.config.cityBike.cityBikeSmallIconZoom) {
      drawRoundIcon(this.tile, feature.geom, 'citybike');
    } else {
      drawCitybikeIcon(this.tile, feature.geom, this.citybikeImageSize);
      this.fetchAndDrawStatus(feature);
    }
  };

  onTimeChange = () => {
    if (this.tile.coords.z > this.config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.fetchAndDrawStatus);
    }
  };

  static getName = () => 'citybike';
}

export default CityBikes;
