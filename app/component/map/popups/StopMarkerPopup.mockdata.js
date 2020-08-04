import cloneDeep from 'lodash/cloneDeep';

const emptyStopData = {
  stop: {
    code: '0612',
    desc: 'Ratapihantie',
    gtfsId: 'HSL:1220434',
    lat: 60.19951,
    lon: 24.93424,
    name: 'Pasilan asema',
    stoptimes: [],
    zoneId: 'A',
  },
  terminal: null,
};

const stoptimesData = [
  {
    realtimeState: 'UPDATED',
    realtimeDeparture: 53820,
    scheduledDeparture: 53820,
    realtimeArrival: 53820,
    scheduledArrival: 53820,
    realtime: true,
    serviceDay: 1524085200,
    pickupType: 'SCHEDULED',
    headsign: 'Jätkäsaari via Kallio',
    stop: {
      code: '0612',
      platformCode: '18',
      id: 'U3RvcDpIU0w6MTIyMDQzNA==',
    },
    trip: {
      gtfsId: 'HSL:1009_20180416_To_2_1457',
      pattern: {
        route: {
          gtfsId: 'HSL:1009',
          shortName: '9',
          longName: 'Jätkäsaari - Rautatieasema - Kallio - Pasilan asema',
          mode: 'TRAM',
          color: null,
          alerts: [],
          agency: {
            name: 'Helsingin seudun liikenne',
            id: 'QWdlbmN5OkhTTA==',
          },
          id: 'Um91dGU6SFNMOjEwMDk=',
        },
        code: 'HSL:1009:1:01',
        id: 'UGF0dGVybjpIU0w6MTAwOToxOjAx',
      },
      id: 'VHJpcDpIU0w6MTAwOV8yMDE4MDQxNl9Ub18yXzE0NTc=',
    },
  },
  {
    realtimeState: 'UPDATED',
    realtimeDeparture: 54142,
    scheduledDeparture: 54120,
    realtimeArrival: 54142,
    scheduledArrival: 54120,
    realtime: true,
    serviceDay: 1524085200,
    pickupType: 'NONE',
    headsign: null,
    stop: {
      code: '0612',
      platformCode: '18',
      id: 'U3RvcDpIU0w6MTIyMDQzNA==',
    },
    trip: {
      gtfsId: 'HSL:1009_20180416_To_1_1424',
      pattern: {
        route: {
          gtfsId: 'HSL:1009',
          shortName: '9',
          longName: 'Jätkäsaari - Rautatieasema - Kallio - Pasilan asema',
          mode: 'TRAM',
          color: null,
          alerts: [],
          agency: {
            name: 'Helsingin seudun liikenne',
            id: 'QWdlbmN5OkhTTA==',
          },
          id: 'Um91dGU6SFNMOjEwMDk=',
        },
        code: 'HSL:1009:0:02',
        id: 'UGF0dGVybjpIU0w6MTAwOTowOjAy',
      },
      stops: [
        {
          id: 'U3RvcDpIU0w6MTIwMzQxNA==',
        },
        {
          id: 'U3RvcDpIU0w6MTIyMDQzNA==',
        },
      ],
      id: 'VHJpcDpIU0w6MTAwOV8yMDE4MDQxNl9Ub18xXzE0MjQ=',
    },
  },
  {
    realtimeState: 'SCHEDULED',
    realtimeDeparture: 54420,
    scheduledDeparture: 54420,
    realtimeArrival: 54420,
    scheduledArrival: 54420,
    realtime: false,
    serviceDay: 1524085200,
    pickupType: 'SCHEDULED',
    headsign: 'Jätkäsaari via Kallio',
    stop: {
      code: '0612',
      platformCode: '18',
      id: 'U3RvcDpIU0w6MTIyMDQzNA==',
    },
    trip: {
      gtfsId: 'HSL:1009_20180416_To_2_1507',
      pattern: {
        route: {
          gtfsId: 'HSL:1009',
          shortName: '9',
          longName: 'Jätkäsaari - Rautatieasema - Kallio - Pasilan asema',
          mode: 'TRAM',
          color: null,
          alerts: [],
          agency: {
            name: 'Helsingin seudun liikenne',
            id: 'QWdlbmN5OkhTTA==',
          },
          id: 'Um91dGU6SFNMOjEwMDk=',
        },
        code: 'HSL:1009:1:01',
        id: 'UGF0dGVybjpIU0w6MTAwOToxOjAx',
      },
      id: 'VHJpcDpIU0w6MTAwOV8yMDE4MDQxNl9Ub18yXzE1MDc=',
    },
  },
  {
    realtimeState: 'UPDATED',
    realtimeDeparture: 54689,
    scheduledDeparture: 54660,
    realtimeArrival: 54689,
    scheduledArrival: 54660,
    realtime: true,
    serviceDay: 1524085200,
    pickupType: 'NONE',
    headsign: null,
    stop: {
      code: '0612',
      platformCode: '18',
      id: 'U3RvcDpIU0w6MTIyMDQzNA==',
    },
    trip: {
      gtfsId: 'HSL:1009_20180416_To_1_1433',
      pattern: {
        route: {
          gtfsId: 'HSL:1009',
          shortName: '9',
          longName: 'Jätkäsaari - Rautatieasema - Kallio - Pasilan asema',
          mode: 'TRAM',
          color: null,
          alerts: [],
          agency: {
            name: 'Helsingin seudun liikenne',
            id: 'QWdlbmN5OkhTTA==',
          },
          id: 'Um91dGU6SFNMOjEwMDk=',
        },
        code: 'HSL:1009:0:02',
        id: 'UGF0dGVybjpIU0w6MTAwOTowOjAy',
      },
      stops: [
        {
          id: 'U3RvcDpIU0w6MTIwMzQxNA==',
        },
        {
          id: 'U3RvcDpIU0w6MTIyMDQzNA==',
        },
      ],
      id: 'VHJpcDpIU0w6MTAwOV8yMDE4MDQxNl9Ub18xXzE0MzM=',
    },
  },
  {
    realtimeState: 'SCHEDULED',
    realtimeDeparture: 54960,
    scheduledDeparture: 54960,
    realtimeArrival: 54960,
    scheduledArrival: 54960,
    realtime: false,
    serviceDay: 1524085200,
    pickupType: 'SCHEDULED',
    headsign: 'Jätkäsaari via Kallio',
    stop: {
      code: '0612',
      platformCode: '18',
      id: 'U3RvcDpIU0w6MTIyMDQzNA==',
    },
    trip: {
      gtfsId: 'HSL:1009_20180416_To_2_1516',
      pattern: {
        route: {
          gtfsId: 'HSL:1009',
          shortName: '9',
          longName: 'Jätkäsaari - Rautatieasema - Kallio - Pasilan asema',
          mode: 'TRAM',
          color: null,
          alerts: [],
          agency: {
            name: 'Helsingin seudun liikenne',
            id: 'QWdlbmN5OkhTTA==',
          },
          id: 'Um91dGU6SFNMOjEwMDk=',
        },
        code: 'HSL:1009:1:01',
        id: 'UGF0dGVybjpIU0w6MTAwOToxOjAx',
      },
      id: 'VHJpcDpIU0w6MTAwOV8yMDE4MDQxNl9Ub18yXzE1MTY=',
    },
  },
];

const basic = {
  ...cloneDeep(emptyStopData),
};
basic.stop.stoptimes = cloneDeep(stoptimesData);
basic.stop.stoptimes.forEach(st => {
  st.realtime = false; // eslint-disable-line no-param-reassign
  st.realtimeState = 'SCHEDULED'; // eslint-disable-line no-param-reassign
});
basic.stop.stoptimes[1].realtime = true;
basic.stop.stoptimes[1].realtimeState = 'UPDATED';
basic.stop.stoptimes[1].stop.platformCode = undefined;
basic.stop.stoptimes[1].trip.pattern.route.mode = 'BUS';
basic.stop.stoptimes[1].trip.pattern.route.shortName = '543B';
basic.stop.stoptimes[2].realtimeState = 'CANCELED';
basic.stop.stoptimes[4].serviceDay = 1524171600;

export default {
  currentTime: 1524138999,
  empty: cloneDeep(emptyStopData),
  basic,
};
