export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

// Needs config for citybike network names
export const getCityBikeNetworkName = (network, config) => {
  return config.citybikeModes.find(
    o => o.networkName.toLowerCase() === network.toLowerCase(),
  );
};
