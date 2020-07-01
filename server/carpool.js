const fetch = require('node-fetch');
const moment = require('moment');

const calulateWeekdays = days => {
  const result = {};
  Object.keys(days).forEach(weekday => {
    const value = days[weekday];
    const bool = value === '1';
    result[weekday.toLowerCase()] = bool;
  });
  return result;
};

const calculateReoccur = options => {
  if (options.time.type === 'recurring') {
    return calulateWeekdays(options.time.weekdays);
  }
  return {};
};

const calculateDate = options => {
  if (options.time.date) {
    return options.time.date.replace('-', '');
  }
  return null;
};

const postCarpoolOffer = options => {
  const body = {
    Contactmobile: options.phoneNumber,
    Currency: 'EUR',
    Enterdate: moment().unix(),
    IDuser: '830d39a4-3584-6f04-a178-25176353b359',
    Places: '3',
    Privacy: {
      Name: '1',
      Mobile: '1',
      Email: '1',
      Landline: '1',
      Licenseplate: '1',
      Car: '1',
    },
    Relevance: '10',
    Reoccur: calculateReoccur(options),
    Routings: [
      {
        RoutingID: null,
        Origin: {
          Address: options.origin.label,
          CountryName: 'Deutschland',
          CountryCode: 'Deutschland',
          Latitude: options.origin.lat,
          Longitude: options.origin.lon,
        },
        Destination: {
          Address: options.destination.label,
          CountryName: 'Deutschland',
          CountryCode: 'Deutschland',
          Latitude: options.destination.lat,
          Longitude: options.destination.lon,
        },
        RoutingIndex: 0,
      },
    ],
    Smoker: 'no',
    Startdate: calculateDate(options),
    Starttime: options.time.departureTime.replace(':', ''),
    Triptype: 'offer',
  };

  const headers = {
    apikey: process.env.FAHRGEMEINSCHAFT_API_KEY,
    authkey: process.env.FAHRGEMEINSCHAFT_AUTH_KEY,
    'content-type': 'application/json',
  };

  return fetch('https://service.live.ride2go.com/trip', {
    method: 'post',
    body: JSON.stringify(body),
    headers,
  }).then(res => res.json());
};

const bodySchema = {
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'http://example.com/example.json',
  type: 'object',
  title: 'The Root Schema',
  description: 'The root schema comprises the entire JSON document.',
  required: ['origin', 'destination', 'time', 'phoneNumber'],
  properties: {
    origin: {
      $id: '#/properties/origin',
      type: 'object',
      title: 'The Origin Schema',
      description: 'An explanation about the purpose of this instance.',
      default: {},
      examples: [
        {
          label: 'Ehningen',
          lon: 8.9462,
          lat: 48.6564,
        },
      ],
      required: ['label', 'lat', 'lon'],
      properties: {
        label: {
          $id: '#/properties/origin/properties/label',
          type: 'string',
          title: 'The Label Schema',
          description: 'An explanation about the purpose of this instance.',
          default: '',
          examples: ['Ehningen'],
        },
        lat: {
          $id: '#/properties/origin/properties/lat',
          type: 'number',
          title: 'The Lat Schema',
          description: 'An explanation about the purpose of this instance.',
          default: 0,
          examples: [48.6564],
        },
        lon: {
          $id: '#/properties/origin/properties/lon',
          type: 'number',
          title: 'The lon Schema',
          description: 'An explanation about the purpose of this instance.',
          default: 0,
          examples: [8.9462],
        },
      },
    },
    destination: {
      $id: '#/properties/destination',
      type: 'object',
      title: 'The Destination Schema',
      description: 'An explanation about the purpose of this instance.',
      default: {},
      examples: [
        {
          label: 'Tübingen',
          lon: 9.0478,
          lat: 48.5222,
        },
      ],
      required: ['label', 'lat', 'lon'],
      properties: {
        label: {
          $id: '#/properties/destination/properties/label',
          type: 'string',
          title: 'The Label Schema',
          description: 'An explanation about the purpose of this instance.',
          default: '',
          examples: ['Tübingen'],
        },
        lat: {
          $id: '#/properties/destination/properties/lat',
          type: 'number',
          title: 'The Lat Schema',
          description: 'An explanation about the purpose of this instance.',
          default: 0,
          examples: [48.5222],
        },
        lon: {
          $id: '#/properties/destination/properties/lon',
          type: 'number',
          title: 'The lon Schema',
          description: 'An explanation about the purpose of this instance.',
          default: 0,
          examples: [9.0478],
        },
      },
    },
    time: {
      $id: '#/properties/time',
      type: 'object',
      title: 'The Time Schema',
      description: 'An explanation about the purpose of this instance.',
      default: {},
      examples: [
        {
          weekdays: {
            monday: true,
            tuesday: true,
            sunday: false,
            wednesday: false,
            thursday: false,
            saturday: true,
            friday: true,
          },
          type: 'recurring',
          departureTime: '14:45',
        },
      ],
      required: ['type', 'departureTime'],
      properties: {
        type: {
          $id: '#/properties/time/properties/type',
          type: 'string',
          enum: ['recurring', 'one-off'],
          examples: ['recurring', 'one-off'],
        },
        departureTime: {
          $id: '#/properties/time/properties/departureTime',
          type: 'string',
          examples: ['14:45'],
        },
        date: {
          $id: '#/properties/time/properties/date',
          type: 'string',
          examples: ['2020-03-18'],
        },
        weekdays: {
          $id: '#/properties/time/properties/weekdays',
          type: 'object',
          default: {},
          examples: [
            {
              thursday: false,
              wednesday: false,
              saturday: true,
              friday: true,
              monday: true,
              tuesday: true,
              sunday: false,
            },
          ],
          required: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
          properties: {
            monday: {
              $id: '#/properties/time/properties/weekdays/properties/monday',
              type: 'boolean',
            },
            tuesday: {
              $id: '#/properties/time/properties/weekdays/properties/tuesday',
              type: 'boolean',
            },
            wednesday: {
              $id: '#/properties/time/properties/weekdays/properties/wednesday',
              type: 'boolean',
            },
            thursday: {
              $id: '#/properties/time/properties/weekdays/properties/thursday',
              type: 'boolean',
            },
            friday: {
              $id: '#/properties/time/properties/weekdays/properties/friday',
              type: 'boolean',
            },
            saturday: {
              $id: '#/properties/time/properties/weekdays/properties/saturday',
              type: 'boolean',
            },
            sunday: {
              $id: '#/properties/time/properties/weekdays/properties/sunday',
              type: 'boolean',
            },
          },
        },
      },
    },
    phoneNumber: {
      $id: '#/properties/phoneNumber',
      type: 'string',
      examples: ['+491512912222'],
    },
  },
};

module.exports = {
  postCarpoolOffer,
  bodySchema,
};
