import translations from '../translations';

const english = translations.en;
const geolocationMessages = {};
const sections = ['heading', 'text', 'a'];
const events = {
  denied: {
    type: 'info',
    persistence: 'repeat', // TODO: enabled for testing. Probably to be shown only once.
    priority: 3,
  },
  failed: {
    type: 'error',
    persistence: 'repeat',
    priority: 4,
  },
};

Object.keys(events).forEach(e => {
  const message = {
    id: `geolocation_${e}`,
    type: events[e].type,
    persistence: events[e].persistence,
    icon: 'geonotifier',
    content: {},
  };

  // assemble multilanguage contents
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
