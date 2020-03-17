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
    return options.time.date.replaceAll('-', '');
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
          Longitude: options.origin.lng,
        },
        Destination: {
          Address: options.destination.label,
          CountryName: 'Deutschland',
          CountryCode: 'Deutschland',
          Latitude: options.destination.lat,
          Longitude: options.destination.lng,
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

module.exports.postCarpoolOffer = postCarpoolOffer;
