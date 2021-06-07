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
  if (featureType) {
    if (layerName === 'stop' && feature.properties.stops) {
      return isFeatureLayerEnabled(feature, 'terminal', mapLayers);
    }
    return Boolean(mapLayers[layerName][featureType]);
  }
  return isLayerEnabled(layerName, mapLayers);
};

const defaultOptions = {
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
  terminal: {
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

export const getMapLayerOptions = (options = {}) => {
  const layerOptions = { ...defaultOptions };

  const { lockedMapLayers, selectedMapLayers, modes } = {
    lockedMapLayers: [],
    selectedMapLayers: [],
    modes: [],
    ...options,
  };
  lockedMapLayers.forEach(key => {
    if (key === 'stop' || key === 'terminal') {
      if (modes.length === 0) {
        Object.keys(layerOptions[key]).forEach(subKey => {
          if (layerOptions[key][subKey]) {
            layerOptions[key][subKey].isLocked = true;
            layerOptions[key][subKey].isSelected = selectedMapLayers.includes(
              key,
            );
          }
        });
      } else {
        modes.forEach(subKey => {
          if (layerOptions[key][subKey]) {
            layerOptions[key][subKey].isLocked = true;
            layerOptions[key][subKey].isSelected = selectedMapLayers.includes(
              key,
            );
          }
        });
      }
    } else {
      layerOptions[key].isLocked = true;
      layerOptions[key].isSelected = selectedMapLayers.includes(key);
    }
  });
  return layerOptions;
};
