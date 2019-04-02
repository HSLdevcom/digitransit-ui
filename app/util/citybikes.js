export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

// TODO: Change according to the real network names TBD later
const scooterNetwork = 'Samocat';
const vantaaNetwork = 'vantaa';

export const getCityBikeNetworkIcon = networks => {
  const iconTemplate = iconName => `icon-icon_${iconName}`;
  const defaultIcon = iconTemplate('citybike');

  if (!Array.isArray(networks) || networks.length === 0) {
    return defaultIcon;
  }

  switch (networks[0]) {
    case scooterNetwork:
      return iconTemplate('scooter');
    case vantaaNetwork:
      return iconTemplate('citybike-vantaa');
    default:
      return defaultIcon;
  }
};
