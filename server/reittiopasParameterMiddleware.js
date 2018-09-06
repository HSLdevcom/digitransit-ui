import moment from 'moment-timezone';
import isFinite from 'lodash/isFinite';
import oldParamParser from '../app/util/oldParamParser';
import { getConfiguration } from '../app/config';

function removeUrlParam(req, param) {
  if (req.query[param]) {
    delete req.query[param];
  }
  const params = Object.keys(req.query)
    .map(k => `${k}=${req.query[k]}`)
    .join('&');
  const url = `${req.path}?${params}`;

  return url;
}

function validateParams(req, config) {
  let url;

  if (config.queryMaxAgeDays && req.query.time) {
    const now = moment.tz(config.timezoneData.split('|')[0]).unix();
    if (now - req.query.time > config.queryMaxAgeDays * 24 * 3600) {
      url = removeUrlParam(req, 'time');
    }
  }

  const numericParams = [
    'time',
    'minTransferTime',
    'transferPenalty',
    'walkBoardCost',
    'walkReluctance',
    'walkSpeed',
  ];
  Object.keys(req.query).forEach(key => {
    if (numericParams.indexOf(key) > -1 && !isFinite(Number(req.query[key]))) {
      url = removeUrlParam(req, key);
    }
  });

  const availableModes = Object.keys(config.modeToOTP).map(k =>
    k.toUpperCase(),
  );

  if (req.query.modes) {
    const modeArray = req.query.modes.split(',');
    modeArray.forEach(key => {
      if (availableModes.indexOf(key) === -1) {
        url = removeUrlParam(req, 'modes');
      }
    });
  }

  return url;
}

export default function reittiopasParameterMiddleware(req, res, next) {
  const config = getConfiguration(req);
  const newUrl = validateParams(req, config);

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
      oldParamParser(req.query, config).then(url => res.redirect(url));
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
