import moment from 'moment';
import { PREFIX_STOPS } from '../../../app/util/path';

export default {
  lang: 'fi', // DT-3347
  onSelectChange: () => {},
  gtfsId: 'HSL:1010',
  activeTab: PREFIX_STOPS,
  className: 'bp-large',
  serviceDay: '20190306',
  relay: {
    setVariables: () => {},
  },
  params: {
    routeId: 'HSL:1010',
    patternId: 'HSL:1010:0:01',
  },
  route: {
    patterns: [
      {
        code: 'HSL:1010:0:01',
        headsign: 'Pikku Huopalahti',
        stops: [
          {
            name: 'Korppaanmäki',
          },
          {
            name: 'Johanneksenkirkko',
          },
          {
            name: 'Tarkk´ampujankatu',
          },
        ],
        tripsForDate: [
          {
            stoptimes: [
              {
                scheduledArrival: 600,
                scheduledDeparture: 600,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                },
              },
              {
                scheduledArrival: 720,
                scheduledDeparture: 720,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                },
              },
            ],
          },
          {
            stoptimes: [
              {
                scheduledArrival: 840,
                scheduledDeparture: 840,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                },
              },
              {
                scheduledArrival: 960,
                scheduledDeparture: 960,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                },
              },
            ],
          },
        ],
      },
      {
        code: 'HSL:1010:0:02',
        headsign: 'Pikku Huopalahti',
        stops: [
          {
            name: 'Korppaanmäki',
          },
          {
            name: 'Johanneksenkirkko',
          },
          {
            name: 'Tarkk´ampujankatu',
          },
        ],
        tripsForDate: [
          {
            stoptimes: [
              {
                scheduledArrival: 1440,
                scheduledDeparture: 1440,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                },
              },
              {
                scheduledArrival: 1500,
                scheduledDeparture: 1500,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                },
              },
            ],
          },
        ],
      },
      {
        code: 'HSL:1010:1:01',
        headsign: 'Korppaanmäki',
        stops: [
          {
            name: 'Pikku Huopalahti',
          },
          {
            name: 'Johanneksenkirkko',
          },
          {
            name: 'Tarkk´ampujankatu',
          },
        ],
        tripsForDate: [
          {
            stoptimes: [
              {
                scheduledArrival: 600,
                scheduledDeparture: 600,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwNA==',
                },
              },
              {
                scheduledArrival: 720,
                scheduledDeparture: 720,
                serviceDay: moment().getTime / 100,
                stop: {
                  id: 'U3RvcDpIU0w6MTI5MTQwMg==',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
