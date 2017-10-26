import cloneDeep from 'lodash/cloneDeep';
import translations from '../translations';

const english = translations.en;
const geolocationMessages = {};
const sections = ['heading', 'text', 'a'];
const events = {
  timeout: {
    type: 'info',
    persistence: 'repeat',
    priority: 2,
  },
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
  prompt: {
    type: 'info',
    persistence: 'repeat',
    priority: 2,
  },
};

Object.keys(events).forEach(e => {
  const message = {
    ...events[e],
    id: `geolocation_${e}`,
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

// create a modified 'still denied' message
const denied2 = cloneDeep(geolocationMessages.denied);
geolocationMessages.stillDenied = denied2;

Object.keys(translations).forEach(lang => {
  const current = translations[lang];
  const content = denied2.content[lang];

  for (let i = 0; i < content.length; i++) {
    const s = content[i];
    if (s.type === 'heading' && current['geolocation-still-denied-heading']) {
      s.content = current['geolocation-still-denied-heading'];
    }
  }
});

export default geolocationMessages;
