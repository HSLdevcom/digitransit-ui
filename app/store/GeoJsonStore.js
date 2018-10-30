import Store from 'fluxible/addons/BaseStore';
import { getJson } from '../util/xhrPromise';

// these are metadata mappable properties
const metaTags = ['textOnly', 'name', 'popupContent'];
const MapJSON = (data, meta) => {
  const tagMap = metaTags.filter(t => !!meta[t]);

  data.features.forEach(feature => {
    const { properties } = feature;
    if (properties) {
      tagMap.forEach(t => {
        if (properties[meta[t]]) {
          properties[t] = properties[meta[t]];
        }
      });
    }
  });
};

class GeoJsonStore extends Store {
  geoJsonData = {};

  static storeName = 'GeoJsonStore';

  getGeoJsonData = async (url, name, metadata) => {
    if (!this.geoJsonData[url]) {
      const response = await getJson(url);
      if (metadata) {
        MapJSON(response, metadata);
      }
      const data = {
        name,
        data: response,
      };
      this.geoJsonData[url] = data;
    }
    return { ...this.geoJsonData[url] };
  };
}

export { GeoJsonStore as default, MapJSON };
