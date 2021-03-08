import translations from '../translations';

/**
 * Generates a multi-language favourite save or delete error message
 * that can be stored in MessageStore.
 *
 * @param {string} type the type of the favourite (stop|station|citybike-station|route|place)
 * @param {boolean} isSave if message is generated for failed save, alternatively it's for failed deletion
 * @returns error message that can be added to MessageStore
 */
export default function failedFavouriteMessage(type, isSave) {
  const english = translations.en;
  const content = {};
  Object.keys(translations).forEach(lang => {
    const current = translations[lang];
    content[lang] = [];

    const headingKey = isSave
      ? `add-favourite-${type}-failed-heading`
      : 'delete-favourite-failed-heading';
    const heading = current[headingKey] || english[headingKey];
    content[lang].push({
      type: 'heading',
      content: heading,
    });

    const textKey = 'favourite-failed-text';
    const text = current[textKey] || english[textKey];
    content[lang].push({
      type: 'text',
      content: text,
    });
  });
  return {
    id: isSave ? 'failedFavouriteSave' : 'failedFavouriteDeletion',
    persistence: 'repeat',
    priority: 4,
    icon: 'caution_white_exclamation',
    iconColor: '#dc0451',
    backgroundColor: '#fdf0f5',
    type: 'error',
    content,
  };
}
