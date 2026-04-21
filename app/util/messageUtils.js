export const favouriteTypes = [
  'stop',
  'station',
  'bikeStation',
  'place',
  'route',
];

/**
 * Get favourite save or delete error message
 * @param {string} type the type of the favourite (stop|station|citybike-station|route|place)
 * @param {boolean} isSave if message is generated for failed save, alternatively it's for failed deletion
 * @returns error message that can be added to MessageStore
 */
export function failedFavouriteMessage(type, isSave) {
  const t = favouriteTypes.includes(type) ? type : favouriteTypes[0];
  const key = isSave
    ? `add-favourite-${t}-failed-heading`
    : 'delete-favourite-failed-heading';
  return {
    id: key,
    persistence: 'repeat',
    priority: 4,
    icon: 'caution_white_exclamation',
    iconColor: '#dc0451',
    backgroundColor: '#fdf0f5',
    type: 'error',
    content: [
      { type: 'heading', content: key },
      { type: 'text', content: 'favourite-failed-text' },
    ],
  };
}
