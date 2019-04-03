export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

export const defaultNetworkConfig = {
  icon: 'citybike',
  name: {},
  type: 'citybike',
};

export const getCityBikeNetworkId = networks => {
  if (!Array.isArray(networks) || networks.length === 0) {
    return undefined;
  }
  return networks[0];
};

export const getCityBikeNetworkConfig = (networkId, config) => {
  if (!networkId || !networkId.toLowerCase) {
    return defaultNetworkConfig;
  }
  const id = networkId.toLowerCase();
  if (
    config &&
    config.cityBike &&
    config.cityBike.networks &&
    config.cityBike.networks[id] &&
    Object.keys(config.cityBike.networks[id]).length > 0
  ) {
    return config.cityBike.networks[id];
  }
  return defaultNetworkConfig;
};

export const getCityBikeNetworkName = (
  networkConfig = defaultNetworkConfig,
  language = 'en',
) => (networkConfig.name && networkConfig.name[language]) || undefined;

export const getCityBikeNetworkIcon = (networkConfig = defaultNetworkConfig) =>
  `icon-icon_${networkConfig.icon || 'citybike'}`;
