// Shared fixtures for the tram 2 -> tram 3 interline at Olympiaterminaali.
// Used by both NaviInstructions and NaviCardExtension interline-messaging tests.
const NOW = Date.parse('2024-05-01T12:00:00Z');
const tr = ms => ({
  scheduledTime: new Date(ms).toISOString(),
  estimated: { time: new Date(ms).toISOString(), delay: 0 },
});

export const config = {
  CONFIG: 'test',
  colors: { primary: '#000000' },
  feedIds: [],
  zones: {},
  language: 'en',
};

export const tram2 = {
  mode: 'TRAM',
  transitLeg: true,
  route: { shortName: '2', mode: 'TRAM' },
  to: {
    stop: {
      name: 'Olympiaterminaali',
      parentStation: null,
      vehicleMode: 'TRAM',
    },
  },
  end: tr(NOW + 5 * 60000),
};

export const tram3 = {
  mode: 'TRAM',
  transitLeg: true,
  interlineWithPreviousLeg: true,
  route: { shortName: '3', mode: 'TRAM' },
  trip: { tripHeadsign: 'Kauppatori' },
  start: tr(NOW + 8 * 60000),
  from: {
    name: 'Olympiaterminaali',
    stop: { name: 'Olympiaterminaali', vehicleMode: 'TRAM' },
  },
};

export const interlineTime = NOW;
