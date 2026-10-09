import { useEffect, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import { getJson } from '../../utils/shared/xhrPromise';

const configCache = new Map();
const dataCache = new Map();

// these are metadata mappable properties
const metaTags = ['textOnly', 'name', 'popupContent'];
export const mapGeoJsonMetadata = (data, meta) => {
  if (isEmpty(meta)) {
    return data;
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
  return data;
};

export const styleGeoJsonFeatures = data => {
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

export const getGeoJsonConfig = url => {
  if (!url) {
    return Promise.resolve(undefined);
  }
  if (!configCache.has(url)) {
    const request = getJson(url)
      .then(response => {
        const root = response.geoJson || response.geojson;
        const layers =
          root && Array.isArray(root.layers) ? root.layers : undefined;
        if (
          (!layers || layers.length === 0) &&
          configCache.get(url) === request
        ) {
          configCache.delete(url);
        }
        return layers;
      })
      .catch(() => {
        if (configCache.get(url) === request) {
          configCache.delete(url);
        }
        return undefined;
      });
    configCache.set(url, request);
  }
  return configCache.get(url);
};

export const getGeoJsonData = (url, name, metadata) => {
  if (!url) {
    return Promise.resolve(undefined);
  }
  const urls = Array.isArray(url) ? url : [url];
  const id = Array.isArray(url) ? `${url[0]}-array` : url;
  if (!dataCache.has(id)) {
    const request = Promise.all(urls.map(itemUrl => getJson(itemUrl)))
      .then(responses => {
        let mapped;
        responses.forEach(response => {
          const styled = styleGeoJsonFeatures(response);
          if (!mapped) {
            mapped = mapGeoJsonMetadata(styled, metadata);
          } else {
            mapped.features.push(...styled.features);
          }
        });
        return { name: name || id, data: mapped };
      })
      .catch(() => {
        if (dataCache.get(id) === request) {
          dataCache.delete(id);
        }
        return null;
      });
    dataCache.set(id, request);
  }
  return dataCache.get(id);
};

/**
 * Fetches and prepares configured GeoJSON layers for map rendering.
 * @param {Object} config GeoJSON config with inline `layers` or `layerConfigUrl`.
 * @returns {Object|null} Loaded GeoJSON layers keyed by URL, or null before loading.
 */
export default function useGeoJsonObjects(config) {
  const [geoJson, setGeoJson] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (
        !config ||
        (!Array.isArray(config.layers) && !config.layerConfigUrl)
      ) {
        return;
      }

      const layers = config.layerConfigUrl
        ? await getGeoJsonConfig(config.layerConfigUrl)
        : config.layers;
      if (Array.isArray(layers) && layers.length > 0) {
        const json = await Promise.all(
          layers.map(async ({ url, name, isOffByDefault, metadata }) => ({
            url: Array.isArray(url) ? url[0] : url,
            isOffByDefault,
            data: await getGeoJsonData(url, name, metadata),
          })),
        );
        const newGeoJson = {};
        json.forEach(({ url, data, isOffByDefault }) => {
          if (data) {
            newGeoJson[url] = { ...data, isOffByDefault };
          }
        });

        if (isMounted) {
          setGeoJson(newGeoJson);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return geoJson;
}
