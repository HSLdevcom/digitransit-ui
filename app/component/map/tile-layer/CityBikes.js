import { VectorTile } from 'vector-tile';
import Protobuf from 'pbf';
import Relay from 'react-relay';
import config from '../../../config';
import { drawRoundIcon } from '../../../util/mapIconUtils';

const scaleratio = (typeof window !== 'undefined' ? window.devicePixelRatio : void 0) || 1;

const citybikeImageSize = 16 * scaleratio;
const availabilityImageSize = 8 * scaleratio;
const notInUseImageSize = 12 * scaleratio;

// TODO: IE doesn't support innerHTML for svg elements, so icon has to be duplicated
const citybikeImageText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.46 283.46" width="${citybikeImageSize}" height="${citybikeImageSize}"><path fill="#FCBC19" d="M0 35C0 16 16 0 35 0h212.7c19.8 0 35.7 16 35.7 35v212.7c0 19.8-16 35.7-35.7 35.7H35c-19 0-35-16-35-35.7V35z"/><g fill="#FFF"><path d="M182.6 129.3L192 154c3.8 10 10 19.4 14.6 24.7 5 5.8 11.7-.2 7.5-5.5-4.5-5.8-9.6-14.4-13.2-23.5l-17-45.2h13.7l7.5 19c1 2.7 2.7 3.8 5 3.8h18.5c2.7 0 4.4-1.3 5-3.5l9.4-27c2-6.2-5.4-9-7.8-3.6-7.4 16.2-22.4 14-28 7.5-2.2-2.6-3.7-4-6.6-4h-19.8v-.3c4.2-6.3 5.4-8.5 6.4-13.3 1-4.6 0-9-2.7-12.2-3-3.6-7.3-5.8-12.6-5.7-7.5.2-13.2 6-14 6.8-1.7 2-1.6 5 .4 6.8 2 1.8 4.8 1.6 6.8-.3 1-1 4-3.7 6.8-3.8 2.4 0 3.7 1 4.4 1.8 1 1 2 3.4 1.3 5.5-.4 1.5-.8 3-4 8-2.6 3-4 6-2.8 9l8 21c-15 10-26.2 24.5-30.4 43.3-3-1.5-6.3-2-10.2-1.6l-2.4.3-26-68c2.4-.6 5.2-1.2 8.7-1.4l2.8-.2c3 0 5-2 5-4.5 0-2.7-2-5-5.4-5H89c-3.6 0-5.8 1.2-5.8 3.8C83 92 90.3 97 97.2 97c1.2 0 2.3-.2 3.4-.4l9 23.8-9 13.8c-9.4-7-20.5-10.6-31.8-10.6-13 0-25.3 4.7-34 12l-2.5 2.3c-2.6 2.5-1.8 7 1.8 7.7.4 0 2.3.6 2.6.7C50.2 149.7 63 158 73.4 169c-2.8 2-4.6 5-4.6 8.2 0 5.7 3.8 9.7 10.2 10.4l57.8 6.2c11 1 19.7-3.6 20.6-17l.3-3c1-17 10-33.6 25-44.5zm-68.7 2l12 31.3-35.4 3.4 23.3-34.6z"/><path d="M77.7 208.6c-17.7 0-32-14.2-32-32 0-5.4 1.4-11 4.7-16.3-2.6-1.7-6-3.3-8.8-4.4-3.8 6-5.8 13.6-5.8 20.7 0 23 19 41.7 42 41.7 14.7 0 28-7.8 35.3-19.8l-11.6-1.3c-5.3 7-14 11.3-23.7 11.3zM211 135c-2.6 0-5 .3-7.3.7l3.6 9.3c1-.2 2.4-.2 3.7-.2 17.5 0 32 14.4 32 32s-14.5 31.8-32 31.8c-17.7 0-32-14.2-32-32 0-7.2 2.6-13.8 6.6-19.2l-4-10.4c-7.6 7.6-12.4 18.2-12.4 29.7 0 23 18.8 41.7 41.8 41.7 23 0 41.7-18.6 41.7-41.7 0-23-18.6-41.6-41.7-41.6z"/></g></svg>`;
const manyAvailableText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${availabilityImageSize}" height="${availabilityImageSize}"><circle fill="#64BE14" cx="12" cy="12" r="12"/><path opacity=".1" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2m0-2C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0z"/><path fill="#FFF" d="M10.6 16.5l-4.2-4.2L7.8 11l2.8 2.7L17 7.3l1.4 1.5"/></svg>`;
const fewAvailableText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${availabilityImageSize}" height="${availabilityImageSize}"><circle fill="#FF9000" cx="12" cy="12" r="12"/><path opacity=".1" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2m0-2C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0z"/><path fill="#FFF" d="M14 14H8v-2h4V5h2"/></svg>`;
const noneAvailableText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${availabilityImageSize}" height="${availabilityImageSize}"><circle fill="#DC0451" cx="12" cy="12" r="12"/><path opacity=".1" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2m0-2C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0z"/><path fill="#FFF" d="M6.8 15.8l9-9L17 8.3l-9 9z"/><path fill="#FFF" d="M6.8 8.2l1.4-1.4 9 9-1.5 1.4z"/></svg>`;
const notInUseText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${notInUseImageSize}" height="${notInUseImageSize}"><path fill="#DC0451" d="M1.565 24c-.4 0-.8-.153-1.107-.46-.61-.61-.61-1.6 0-2.212L21.328.458c.61-.61 1.602-.61 2.213 0 .612.61.612 1.602 0 2.213L2.67 23.54c-.304.307-.704.46-1.105.46z"/><path fill="#DC0451" d="M22.435 24c-.4 0-.8-.153-1.107-.46L.458 2.673C-.15 2.062-.15 1.07.46.46c.612-.612 1.603-.612 2.214 0l20.87 20.87c.61.61.61 1.6 0 2.212-.306.305-.707.458-1.107.458z"/></svg>`;

const citybikeImage = new Image(citybikeImageSize, citybikeImageSize);
citybikeImage.src = `data:image/svg+xml;base64,${btoa(citybikeImageText)}`;
const manyAvailableImage = new Image(availabilityImageSize, availabilityImageSize);
manyAvailableImage.src = `data:image/svg+xml;base64,${btoa(manyAvailableText)}`;
const fewAvailableImage = new Image(availabilityImageSize, availabilityImageSize);
fewAvailableImage.src = `data:image/svg+xml;base64,${btoa(fewAvailableText)}`;
const noneAvailableImage = new Image(availabilityImageSize, availabilityImageSize);
noneAvailableImage.src = `data:image/svg+xml;base64,${btoa(noneAvailableText)}`;
const notInUseImage = new Image(notInUseImageSize, notInUseImageSize);
notInUseImage.src = `data:image/svg+xml;base64,${btoa(notInUseText)}`;

const timeOfLastFetch = {};

class CityBikes {
  constructor(tile) {
    this.tile = tile;
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
            this.features.push(vt.layers.stations.feature(i));
          }
        }

        for (const i of this.features) {
          actionFn(i);
        }
      }, err => console.log(err));
    });

  drawCityBikeBaseIcon = (geom) => {
    this.tile.ctx.drawImage(
      citybikeImage,
      (geom[0][0].x / this.tile.ratio) - citybikeImageSize / 2,
      (geom[0][0].y / this.tile.ratio) - citybikeImageSize / 2
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
            notInUseImage,
            geom[0][0].x / this.tile.ratio - notInUseImageSize / 2,
            geom[0][0].y / this.tile.ratio - notInUseImageSize / 2
          );

          return;
        } else if (result.bikesAvailable > config.cityBike.fewAvailableCount) {
          image = manyAvailableImage;
        } else if (result.bikesAvailable > 0) {
          image = fewAvailableImage;
        } else {
          image = noneAvailableImage;
        }

        this.tile.ctx.drawImage(
          image,
          this.calculatePosition(geom[0][0].x),
          this.calculatePosition(geom[0][0].y)
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
    coord / this.tile.ratio - citybikeImageSize / 2 - availabilityImageSize / 2 + 2 * scaleratio

  addFeature = (feature) => {
    const geom = feature.loadGeometry();
    if (this.tile.coords.z <= config.cityBike.cityBikeSmallIconZoom) {
      drawRoundIcon(this.tile, geom, 'citybike');
    } else {
      this.drawCityBikeBaseIcon(geom);
      this.fetchAndDrawStatus(feature, geom);
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
