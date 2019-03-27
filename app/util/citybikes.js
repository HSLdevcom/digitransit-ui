export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

// TODO: Change according to the real network names TBD later
const defaultNetwork = 'citybike';
const scooterNetwork = 'samocat';
const vantaaNetwork = 'vantaa';

export const getCityBikeNetworkName = network => {
  let name = defaultNetwork;
  if (network === scooterNetwork) {
    name = 'scooter';
  } else if (network === vantaaNetwork) {
    name = 'citybike-vantaa';
  }
  return name;
};

export const getCityBikeNetworkIcon = network => {
  const iconName = getCityBikeNetworkName(network);

  return `icon-icon_${iconName}`;
};
