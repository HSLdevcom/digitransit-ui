// Parse from, to and time parameters from old reittiopas searches
import moment from 'moment-timezone/moment-timezone';
import { getGeocodingResult } from './searchUtils';
import { locationToOTP } from './otpStrings';
import { kkj2ToWgs84 } from './geo-utils';
import { PREFIX_ITINERARY_SUMMARY } from './path';

const placeParser = /^[^*]*\*([^*]*)\*([^*]*)\*([^*]*)/;

function parseGeocodingResults(results) {
  if (!Array.isArray(results) || results.length < 1) {
    return ' ';
  }
  return locationToOTP({
    address: results[0].properties.label,
    lon: results[0].geometry.coordinates[0],
    lat: results[0].geometry.coordinates[1],
  });
}

function parseLocation(location, input, config) {
  if (location) {
    const parsedFrom = placeParser.exec(location);
    if (parsedFrom) {
      const coords = kkj2ToWgs84([parsedFrom[2], parsedFrom[3]]);
      return Promise.resolve(
        locationToOTP({
          address: parsedFrom[1],
          lon: coords[0],
          lat: coords[1],
        }),
      );
    }
    return getGeocodingResult(
      location,
      config.searchParams,
      null,
      null,
      null,
      config,
    )
      .then(parseGeocodingResults)
      .catch(() => ' ');
  } else if (input) {
    return getGeocodingResult(
      input,
      config.searchParams,
      null,
      null,
      null,
      config,
    )
      .then(parseGeocodingResults)
      .catch(() => ' ');
  }
  return Promise.resolve(' ');
}

function parseTime(query, config) {
  const time = moment.tz(config.timezoneData.split('|')[0]);
  let hasTime;
  let timeStr = '';

  if (query.daymonthyear) {
    const dmy = query.daymonthyear.split('.');
    if (dmy.length === 3) {
      time.date(dmy[0]);
      time.month(parseInt(dmy[1], 10) - 1);
      time.year(dmy[2]);
      hasTime = true;
    }
  }
  if (query.year) {
    time.year(query.year);
    hasTime = true;
  }
  if (query.month) {
    time.month(query.month - 1);
    hasTime = true;
  }
  if (query.day) {
    time.date(query.day);
    hasTime = true;
  }
  if (query.hour) {
    time.hour(query.hour);
    hasTime = true;
  }
  if (query.minute) {
    time.minute(query.minute);
    hasTime = true;
  }

  if (hasTime) {
    if (config.queryMaxAgeDays) {
      const now = moment.tz(config.timezoneData.split('|')[0]);
      if (now.diff(time, 'days') < config.queryMaxAgeDays) {
        timeStr = `time=${time.unix()}`;
      }
    }
  }
  if (query.timetype === 'arrival') {
    if (timeStr.length > 0) {
      timeStr = `${timeStr}&arriveBy=true`;
    } else {
      timeStr = 'arriveBy=true';
    }
  }
  return Promise.resolve(timeStr);
}

export default function oldParamParser(query, config) {
  return Promise.all([
    parseLocation(query.from, query.from_in, config),
    parseLocation(query.to, query.to_in, config),
    parseTime(query, config),
  ])
    .then(([from, to, time]) => {
      if (from && from.length > 1 && to && to.length > 1) {
        // can redirect to itinerary summary page
        return `/${PREFIX_ITINERARY_SUMMARY}/${from}/${to}/?${time}`;
      }
      return `/${from}/${to}/`;
    })
    .catch(() => '/');
}
