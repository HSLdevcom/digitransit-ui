import moment from 'moment-timezone';
import oldParamParser from '../app/util/oldParamParser';
import { getConfiguration } from '../app/config';

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
  const newUrl = validateTime(req, config);
  if (newUrl) {
    res.redirect(newUrl);
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
      oldParamParser(req.query, config, next).then(url => res.redirect(url));
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
