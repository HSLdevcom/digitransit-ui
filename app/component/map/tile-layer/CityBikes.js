import { VectorTile } from 'vector-tile';
import Protobuf from 'pbf';
import Relay from 'react-relay';
import config from '../../../config';
import { drawRoundIcon, getImageFromSprite } from '../../../util/mapIconUtils';
import glfun from 'mapbox-gl-function';

const getScale = glfun({
  type: 'exponential',
  base: 1,
  domain: [13, 20],
  range: [0.8, 1.6],
});

const timeOfLastFetch = {};

class CityBikes {
  constructor(tile) {
    this.tile = tile;

    this.scaleratio = typeof window !== 'undefined' && window.devicePixelRatio || 1;
    this.citybikeImageSize = 16 * this.scaleratio * getScale({ $zoom: this.tile.coords.z });
    this.availabilityImageSize = 8 * this.scaleratio * getScale({ $zoom: this.tile.coords.z });
    this.notInUseImageSize = 12 * this.scaleratio * getScale({ $zoom: this.tile.coords.z });

    this.promise = this.fetchWithAction(this.addFeature);
  }

  fetchWithAction = (actionFn) =>
    fetch(`${config.URL.CITYBIKE_MAP}` +
      `${this.tile.coords.z + (this.tile.props.zoomOffset || 0)}/` +
      `${this.tile.coords.x}/${this.tile.coords.y}.pbf`
    ).then(res => {
      if (res.status !== 200) {
        return undefined;
      }

      return res.arrayBuffer().then(buf => {
        const vt = new VectorTile(new Protobuf(buf));

        this.features = [];

        if (vt.layers.stations != null) {
          for (let i = 0, ref = vt.layers.stations.length - 1; i <= ref; i++) {
            const feature = vt.layers.stations.feature(i);
            feature.geom = feature.loadGeometry()[0][0];
            this.features.push(feature);
          }
        }

        for (const i of this.features) {
          actionFn(i);
        }
      }, err => console.log(err));
    });

  drawCityBikeBaseIcon = (geom) => {
    this.tile.ctx.drawImage(
      getImageFromSprite('icon-icon_citybike', this.citybikeImageSize, this.citybikeImageSize),
      (geom.x / this.tile.ratio) - this.citybikeImageSize / 2,
      (geom.y / this.tile.ratio) - this.citybikeImageSize / 2
    );
  }

  fetchAndDrawStatus = (feature, geom) => {
    const query = Relay.createQuery(Relay.QL`
    query Test($id: String!){
      bikeRentalStation(id: $id) {
        bikesAvailable
        spacesAvailable
      }
    }`, { id: feature.properties.id });

    const lastFetch = timeOfLastFetch[feature.properties.id];
    const currentTime = new Date().getTime();

    const callback = readyState => {
      if (readyState.done) {
        timeOfLastFetch[feature.properties.id] = new Date().getTime();
        const result = Relay.Store.readQuery(query)[0];
        let image;

        if (result.bikesAvailable === 0 && result.spacesAvailable === 0) {
          this.tile.ctx.drawImage(
            getImageFromSprite(
              'icon-icon_not-in-use', this.notInUseImageSize, this.notInUseImageSize),
            geom.x / this.tile.ratio - this.notInUseImageSize / 2,
            geom.y / this.tile.ratio - this.notInUseImageSize / 2
          );

          return;
        } else if (result.bikesAvailable > config.cityBike.fewAvailableCount) {
          image = getImageFromSprite(
            'icon-icon_good-availability', this.availabilityImageSize, this.availabilityImageSize);
        } else if (result.bikesAvailable > 0) {
          image = getImageFromSprite(
            'icon-icon_poor-availability', this.availabilityImageSize, this.availabilityImageSize);
        } else {
          image = getImageFromSprite(
            'icon-icon_no-availability', this.availabilityImageSize, this.availabilityImageSize);
        }

        this.tile.ctx.drawImage(
          image,
          this.calculatePosition(geom.x),
          this.calculatePosition(geom.y)
        );
      }
    };

    if (lastFetch && currentTime - lastFetch <= 30000) {
      Relay.Store.primeCache({
        query,
      }, callback);
    } else {
      Relay.Store.forceFetch({
        query,
      }, callback);
    }
  }

  calculatePosition = (coord) =>
    coord / this.tile.ratio -
    this.citybikeImageSize / 2 - this.availabilityImageSize / 2 + 2 * this.scaleratio

  addFeature = (feature) => {
    if (this.tile.coords.z <= config.cityBike.cityBikeSmallIconZoom) {
      drawRoundIcon(this.tile, feature.geom, 'citybike');
    } else {
      this.drawCityBikeBaseIcon(feature.geom);
      this.fetchAndDrawStatus(feature, feature.geom);
    }
  }

  onTimeChange = () => {
    if (this.tile.coords.z > config.cityBike.cityBikeSmallIconZoom) {
      this.fetchWithAction(this.drawCityBikeStatus);
    }
  }

  drawCityBikeStatus = (feature) => {
    const geom = feature.loadGeometry();
    this.fetchAndDrawStatus(feature, geom);
  }

  static getName = () => 'citybike';
}

export default CityBikes;
