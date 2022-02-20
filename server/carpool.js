const fetch = require('node-fetch');

const postCarpoolOffer = options => {
  const body = {
    stops: [
      {
        address: options.origin.label,
        departTime: options.time.departureTime,
        coordinates: {
          lat: Math.round(options.origin.lat * 100000) / 100000,
          lon: Math.round(options.origin.lon * 100000) / 100000,
        },
      },
      {
        address: options.destination.label,
        coordinates: {
          lat: Math.round(options.destination.lat * 100000) / 100000,
          lon: Math.round(options.destination.lon * 100000) / 100000,
        },
      },
    ],
    departTime: options.time.departureTime,
    email: options.email,
    phoneNumber: options.phoneNumber,
    acceptTerms: true,
  };

  if (options.time.date) {
    body.departDate = options.time.date;
  } else {
    const WEEKDAYS = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const offerWeekdays = [];
    WEEKDAYS.forEach(weekday => {
      if (options.time.weekdays[weekday]) {
        offerWeekdays.push(weekday);
      }
    });
    body.weekdays = offerWeekdays;
  }

  const headers = {
    'X-API-Key': process.env.FAHRGEMEINSCHAFT_API_KEY,
    'Content-Type': 'application/json',
  };

  const bodyContent = JSON.stringify(body);

  return fetch('https://fahrgemeinschaft.de/api/v1/trip', {
    method: 'post',
    body: bodyContent,
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
