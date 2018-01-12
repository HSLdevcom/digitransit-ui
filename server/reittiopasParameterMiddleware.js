import proj4 from 'proj4';
import moment from 'moment-timezone';
import { locationToOTP } from '../app/util/otpStrings';
import { getGeocodingResult } from '../app/util/searchUtils';
import { getConfiguration } from '../app/config';

const kkj2 =
  '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=2500000 +y_0=0 +ellps=intl +towgs84=-96.0617,-82.4278,-121.7535,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs';

const kkj2ToWgs84 = proj4(kkj2, 'WGS84').forward;
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

function parseLocation(location, input, config, next) {
  if (location) {
    const parsedFrom = placeParser.exec(location);
    if (parsedFrom) {
      const coords = kkj2ToWgs84([
        parseFloat(parsedFrom[2]),
        parseFloat(parsedFrom[3]),
      ]);
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
      .catch(next);
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
      .catch(next);
  }
  return ' ';
}

function validateTime(req, config) {
  if (config.queryMaxAgeDays && req.query.time) {
    const now = moment.tz(config.timezoneData.split('|')[0]).unix();
    if (now - req.query.time > config.queryMaxAgeDays * 24 * 3600) {
      delete req.query.time;
      const params = Object.keys(req.query)
        .map(k => `${k}=${req.query[k]}`)
        .join('&');
      const url = `${req.path}?${params}`;

      return url;
    }
  }
  return null;
}

export default function reittiopasParameterMiddleware(req, res, next) {
  const config = getConfiguration(req);
  const url = validateTime(req, config);
  if (url) {
    res.redirect(url);
  } else if (config.redirectReittiopasParams) {
    const parts = req.path.split('/');
    const lang = parts[1];
    if (config.availableLanguages.includes(lang)) {
      res.cookie('lang', lang, {
        // Good up to one year
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      });
    }
    if (
      req.query.from ||
      req.query.to ||
      req.query.from_in ||
      req.query.to_in
    ) {
      const time = moment.tz(config.timezoneData.split('|')[0]);
      if (req.query.year) {
        time.year(req.query.year);
      }
      if (req.query.month) {
        time.month(req.query.month - 1);
      }
      if (req.query.day) {
        time.date(req.query.day);
      }
      if (req.query.hour) {
        time.hour(req.query.hour);
      }
      if (req.query.minute) {
        time.minute(req.query.minute);
      }
      let timeStr = `time=${time.unix()}&`;

      if (config.queryMaxAgeDays) {
        const now = moment.tz(config.timezoneData.split('|')[0]);
        if (now.diff(time, 'days') > config.queryMaxAgeDays) {
          // too old route time, drop it
          timeStr = '';
        }
      }
      const arriveBy = req.query.timetype === 'arrival';

      Promise.all([
        parseLocation(req.query.from, req.query.from_in, config, next),
        parseLocation(req.query.to, req.query.to_in, config, next),
      ]).then(([from, to]) =>
        res.redirect(`/${from}/${to}?${timeStr}arriveBy=${arriveBy}`),
      );
    } else if (
      ['/fi/', '/en/', '/sv/', '/ru/', '/slangi/'].includes(req.path)
    ) {
      res.redirect('/');
    } else {
      next();
    }
  } else {
    next();
  }
}
