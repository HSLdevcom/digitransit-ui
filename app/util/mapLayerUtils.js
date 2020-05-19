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
 * @param {*} config The configuration for this software installation.
 */
export const isFeatureLayerEnabled = (
  feature,
  layerName,
  mapLayers,
  config = undefined,
) => {
  if (!feature || !layerName || !mapLayers) {
    return false;
  }
  if (!Object.keys(mapLayers).includes(layerName)) {
    return false;
  }
  const featureType = (feature.properties.type || '').toLocaleLowerCase();
  if (featureType) {
    if (layerName === 'stop' && feature.properties.stops) {
      return isFeatureLayerEnabled(feature, 'terminal', mapLayers, config);
    }
    return Boolean(mapLayers[layerName][featureType]);
  }
  if (layerName === 'ticketSales' && feature.properties.Tyyppi && config) {
    const customLayerName =
      config.mapLayers.featureMapping.ticketSales[feature.properties.Tyyppi];
    return Boolean(mapLayers.ticketSales[customLayerName]);
  }
  return isLayerEnabled(layerName, mapLayers);
};
