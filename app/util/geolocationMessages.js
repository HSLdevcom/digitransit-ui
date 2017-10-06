import translations from '../translations';

const english = translations.en;
const geolocationMessages = {};
const events = ['denied'];
const sections = ['heading', 'text', 'a'];

let i = 0;

events.forEach(e => {
  const message = {
    id: `geolocation_${i}`,
    persistence: 'repeat',
    content: {},
  };
  i += 1;

  Object.keys(translations).forEach(lang => {
    const current = translations[lang];
    message.content[lang] = [];

    sections.forEach(s => {
      const key = `geolocation-${e}-${s}`;
      const section = current[key] || english[key];

      if (section) {
        message.content[lang].push({
          type: s,
          content: section,
        });
      }
    });
  });

  geolocationMessages[e] = message;
});

export default geolocationMessages;
