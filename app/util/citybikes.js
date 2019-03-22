export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

export const getCityBikeNetwork = network => {
  let iconName = 'citybike';

  // TODO: Change according to the real network names TBD later
  if (network === 'samocat') {
    iconName = 'scooter';
  } else if (network === 'vantaa') {
    iconName = 'citybike-vantaa';
  }
  return `icon-icon_${iconName}`;
};
