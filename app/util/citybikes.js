export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

const defaultNetwork = 'citybike';
const scooterNetwork = 'samocat';
const vantaaNetwork = 'vantaa';

export const getCityBikeNetworkIcon = network => {
  let iconName = defaultNetwork;

  // TODO: Change according to the real network names TBD later
  if (network === scooterNetwork) {
    iconName = 'scooter';
  } else if (network === vantaaNetwork) {
    iconName = 'citybike-vantaa';
  }
  return `icon-icon_${iconName}`;
};
