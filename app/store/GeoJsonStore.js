import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import Store from 'fluxible/addons/BaseStore';

import { getJson } from '../util/xhrPromise';

// these are metadata mappable properties
const metaTags = ['textOnly', 'name', 'popupContent'];
const MapJSON = (data, meta) => {
  if (isEmpty(meta)) {
    return;
  }
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

const styleFeatures = data => {
  if (!data.features.some(feature => Array.isArray(feature.styles))) {
    return data;
  }
  const output = {
    type: 'FeatureCollection',
    features: [],
  };
  data.features.forEach(feature => {
    if (!Array.isArray(feature.styles)) {
      output.features.push(cloneDeep(feature));
      return;
    }
    feature.styles.forEach(style => {
      const clone = cloneDeep(feature);
      delete clone.styles;
      clone.style = cloneDeep(style);
      output.features.push(clone);
    });
  });
  return output;
};

class GeoJsonStore extends Store {
  geoJsonData = {};

  static storeName = 'GeoJsonStore';

  get layers() {
    return this.geoJsonLayers;
  }

  set layers(value) {
    this.geoJsonLayers = value;
  }

  getGeoJsonConfig = async url => {
    if (!url) {
      return undefined;
    }

    if (!this.layers) {
      const response = await getJson(url);
      const root = response.geoJson || response.geojson;
      if (root && Array.isArray(root.layers)) {
        this.layers = root.layers;
      }
    }

    return this.layers;
  };

  getGeoJsonData = async (url, name, metadata) => {
    if (!url) {
      return undefined;
    }

    if (!this.geoJsonData[url]) {
      const response = await getJson(url);
      if (metadata) {
        MapJSON(response, metadata);
      }
      const data = {
        name: name || url,
        data: styleFeatures(response),
      };
      this.geoJsonData[url] = data;
    }

    return { ...this.geoJsonData[url] };
  };
}

export { GeoJsonStore as default, MapJSON, styleFeatures };
