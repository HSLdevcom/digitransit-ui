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
    const size = feature.styles.length;
    feature.styles.forEach((style, index) => {
      const clone = cloneDeep(feature);
      delete clone.styles;
      clone.style = cloneDeep(style);
      if (size === 2) {
        clone.style.type = index === 1 ? 'halo' : 'line';
      }
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
    let id;
    let urlArr;
    if (Array.isArray(url)) {
      [id] = url;
      urlArr = url;
    } else {
      id = url;
      urlArr = [url];
    }
    if (!this.geoJsonData[id]) {
      const responses = await Promise.all(urlArr.map(u => getJson(u)));
      const mapped = responses.map(r => {
        if (metadata) {
          MapJSON(r, metadata);
        }
        return styleFeatures(r);
      });
      for (let i = 1; i < mapped.length; i++) {
        mapped[0].features = mapped[0].features.concat(mapped[i].features);
      }
      const data = {
        name: name || id,
        data: mapped[0],
      };
      this.geoJsonData[id] = data;
    }
    return { ...this.geoJsonData[id] };
  };
}

export { GeoJsonStore as default, MapJSON, styleFeatures };
