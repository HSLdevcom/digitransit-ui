import legacyParamParser from '../../utils/server/legacyParamParser.js';
import normalizePath from '../../utils/server/normalizePath.js';
import { getConfiguration } from '../configs/config.js';

function formatQuery(query) {
  const params = Object.keys(query)
    .map(k => `${k}=${query[k]}`)
    .join('&');

  return params ? `?${params}` : '';
}

export function validateParams(req, config) {
  const { time: timeParam, ...query } = req.query;
  const timeNow = Date.now() / 1000; // Convert to seconds
  const isStale =
    config.queryMaxAgeDays &&
    timeParam &&
    timeNow - timeParam > config.queryMaxAgeDays * 24 * 3600;
  const isInvalid =
    timeParam !== undefined && !Number.isFinite(Number(timeParam));

  return isStale || isInvalid
    ? `${normalizePath(req.path)}${formatQuery(query)}`
    : undefined;
}

export default function legacyUrlMiddleware(req, res, next) {
  const config = getConfiguration(req);
  const newUrl = validateParams(req, config);
  if (newUrl) {
    res.redirect(newUrl);
  } else if (
    config.redirectReittiopasParams &&
    (req.query.from || req.query.to || req.query.from_in || req.query.to_in)
  ) {
    legacyParamParser(req.query, config)
      .then(url => res.redirect(url))
      .catch(next);
  } else {
    next();
  }
}
