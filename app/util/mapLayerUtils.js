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
export const isFeatureLayerEnabled = (
  feature,
  layerName,
  mapLayers,
  isHybridStation = false,
) => {
  if (!feature || !layerName || !mapLayers) {
    return false;
  }
  if (!Object.keys(mapLayers).includes(layerName)) {
    return false;
  }
  const featureType = (feature.properties.type || '').toLocaleLowerCase();
  if (isHybridStation && featureType) {
    const featureTypes = feature.properties.type.split(',');
    return featureTypes.some(type =>
      Boolean(mapLayers[layerName][type.toLocaleLowerCase()]),
    );
  }
  if (featureType && layerName !== 'roadworks') {
    if (layerName === 'stop' && feature.properties.stops) {
      return isFeatureLayerEnabled(feature, 'terminal', mapLayers);
    }
    return Boolean(mapLayers[layerName][featureType]);
  }
  return isLayerEnabled(layerName, mapLayers);
};

export const getMapLayerOptions = (options = {}) => {
  const layerOptions = {
    parkAndRide: {
      isLocked: false,
      isSelected: false,
    },
    stop: {
      bus: {
        isLocked: false,
        isSelected: false,
      },
      ferry: {
        isLocked: false,
        isSelected: false,
      },
      rail: {
        isLocked: false,
        isSelected: false,
      },
      subway: {
        isLocked: false,
        isSelected: false,
      },
      tram: {
        isLocked: false,
        isSelected: false,
      },
    },
    vehicles: {
      isLocked: false,
      isSelected: false,
    },
    citybike: {
      isLocked: false,
      isSelected: false,
    },
  };
  const allModes = ['bus', 'tram', 'rail', 'subway', 'ferry'];
  const { lockedMapLayers, selectedMapLayers } = {
    lockedMapLayers: [],
    selectedMapLayers: [],
    ...options,
  };
  lockedMapLayers.forEach(key => {
    // Stop keyword locks every mode
    if (key === 'stop') {
      Object.keys(layerOptions[key]).forEach(subKey => {
        if (layerOptions[key][subKey]) {
          layerOptions[key][subKey].isLocked = true;
          layerOptions[key][subKey].isSelected =
            selectedMapLayers.includes(subKey) ||
            selectedMapLayers.includes(key);
        }
      });
    } else if (layerOptions.stop[key] && allModes.includes(key)) {
      layerOptions.stop[key].isLocked = lockedMapLayers.includes(key);
      layerOptions.stop[key].isSelected = selectedMapLayers.includes(key);
    } else if (layerOptions[key]) {
      layerOptions[key].isLocked = true;
      layerOptions[key].isSelected = selectedMapLayers.includes(key);
    }
  });
  return layerOptions;
};
