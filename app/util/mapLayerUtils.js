export const isLayerEnabled = (layerName, mapLayers) => {
  if (!layerName || !mapLayers) {
    return false;
  }
  const mapLayer = mapLayers[layerName];
  const keys = Object.keys(mapLayer);
  if (keys.length === 0) {
    return Boolean(mapLayer);
  }
  if (keys.map(key => mapLayer[key]).every(value => value === false)) {
    return false;
  }
  return true;
};

export const isFeatureLayerEnabled = (
  feature,
  layerName,
  mapLayers,
  config,
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
  if (layerName === 'ticketSales' && feature.properties.TYYPPI) {
    const customLayerName =
      config.mapLayers.featureMapping.ticketSales[feature.properties.TYYPPI];
    return Boolean(mapLayers.ticketSales[customLayerName]);
  }
  return isLayerEnabled(layerName, mapLayers);
};
