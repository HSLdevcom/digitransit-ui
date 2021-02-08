import { v4 as uuid } from 'uuid';

import translations from '../translations';

const english = translations.en;
const content = {};
const sections = ['heading', 'text'];
Object.keys(translations).forEach(lang => {
  const current = translations[lang];
  content[lang] = [];

  sections.forEach(s => {
    const key = `add-favourite-stop-failed-${s}`;
    const section = current[key] || english[key];

    if (section) {
      content[lang].push({
        type: s,
        content: section,
      });
    }
  });
});

export default function failedFavouriteStopMessage() {
  return {
    id: uuid(),
    priority: -1,
    icon: 'caution_white_exclamation',
    iconColor: '#dc0451',
    backgroundColor: '#fdf0f5',
    type: 'error',
    content,
  };
}
