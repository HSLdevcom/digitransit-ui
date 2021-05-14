/**
 * Checks if the given map layer is enabled in the configuration.
 *
 * @param {string} layerName The name of the layer.
 * @param {*} mapLayers The map layer configuration.
 */
export const isLayerEnabled = (layerName, mapLayers) => {
  if (!layerName || !mapLayers) {
    return false;
  }
  const mapLayer = mapLayers[layerName];
  if (!mapLayer) {
    return false;
  }
  if (typeof mapLayer !== 'object') {
    return Boolean(mapLayer);
  }
  const keys = Object.keys(mapLayer);
  if (keys.map(key => mapLayer[key]).some(value => value === true)) {
    return true;
  }
  return false;
};

/**
 * Check if the given feature and map layer are enabled in the configuration.
 *
 * @param {*} feature The feature received from OTP / another source.
 * @param {*} layerName The name of the layer.
 * @param {*} mapLayers The map layer configuration.
 */
export const isFeatureLayerEnabled = (feature, layerName, mapLayers) => {
  if (!feature || !layerName || !mapLayers) {
    return false;
  }
  if (!Object.keys(mapLayers).includes(layerName)) {
    return false;
  }
  const featureType = (feature.properties.type || '').toLocaleLowerCase();

  if (featureType && layerName !== 'roadworks') {
    if (layerName === 'stop' && feature.properties.stops) {
      return isFeatureLayerEnabled(feature, 'terminal', mapLayers);
    }
    return Boolean(mapLayers[layerName][featureType]);
  }
  return isLayerEnabled(layerName, mapLayers);
};
