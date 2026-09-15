const events = {
  timeout: { type: 'info', persistence: 'repeat', priority: 2 },
  denied: {
    type: 'info',
    persistence: 'repeat',
    priority: 3,
  },
  failed: { type: 'error', persistence: 'repeat', priority: 4 },
  prompt: { type: 'info', persistence: 'repeat', priority: 2 },
};

const sections = ['heading', 'text', 'a'];

export const geolocationMessages = Object.fromEntries(
  Object.entries(events).map(([e, meta]) => [
    e,
    {
      ...meta,
      id: `geolocation_${e}`,
      icon: 'caution_white_exclamation',
      iconColor: '#dc0451',
      backgroundColor: '#fdf0f5',
      content: sections.map(s => ({
        type: s,
        content: `geolocation-${e}-${s}`,
      })),
    },
  ]),
);
