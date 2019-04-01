export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

// TODO: Change according to the real network names TBD later
const scooterNetwork = 'Samocat';
const vantaaNetwork = 'vantaa';

export const getCityBikeNetworkName = networks => {
  const defaultName = 'citybike';

  if (!Array.isArray(networks) || networks.length === 0) {
    return defaultName;
  }

  switch (networks[0]) {
    case scooterNetwork:
      return 'scooter';
    case vantaaNetwork:
      return 'citybike-vantaa';
    default:
      return defaultName;
  }
};

export const getCityBikeNetworkIcon = networks =>
  `icon-icon_${getCityBikeNetworkName(networks)}`;
