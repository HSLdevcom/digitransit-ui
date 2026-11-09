import legacyParamParser from '../../utils/server/legacyParamParser.js';
import normalizePath from '../../utils/shared/normalizePath.js';
import { getConfiguration } from '../configs/config.js';
import { getLanguagePrefix } from '../../utils/shared/languageUtils.js';
import { addQueryParams, getSearchParams } from '../../utils/shared/path.js';

export function validateParams(req, config) {
  // The raw query, so that repeated keys and encoding survive the redirect.
  const query = getSearchParams(req.originalUrl);
  const timeParam = query.get('time') ?? undefined;
  query.delete('time');
  const timeNow = Date.now() / 1000; // Convert to seconds
  const isStale =
    config.queryMaxAgeDays &&
    timeParam &&
    timeNow - timeParam > config.queryMaxAgeDays * 24 * 3600;
  const isInvalid =
    timeParam !== undefined && !Number.isFinite(Number(timeParam));

  return isStale || isInvalid
    ? addQueryParams(normalizePath(req.path), query)
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
      .then(url =>
        res.redirect(`${getLanguagePrefix(config, res.locals.language)}${url}`),
      )
      .catch(next);
  } else {
    next();
  }
}
