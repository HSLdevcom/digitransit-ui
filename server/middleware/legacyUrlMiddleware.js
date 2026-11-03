import legacyParamParser from '../../utils/shared/legacyParamParser.js';
import { LEGACY_LOCALES } from '../../utils/shared/constants.js';
import { getConfiguration } from '../configs/config.js';

const PATH_SEPARATORS = /[\\/]+/;

/**
 * Collapses repeated `/` and `\` (browsers treat `\` as `/`) so the result
 * can't be a protocol-relative URL.
 */
function normalizePath(path) {
  return `/${path.split(PATH_SEPARATORS).filter(Boolean).join('/')}`;
}

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

const fixLocaleParam = (req, lang) => {
  // override locale query param with the selected language
  req.query.locale = lang === 'slangi' ? 'fi' : lang;
  return formatQuery(req.query);
};

export const dropPathLanguageAndFixLocaleParam = (req, lang) => {
  const segments = req.path.split(PATH_SEPARATORS).filter(Boolean);
  if (segments[0] === lang) {
    segments.shift();
  }
  return normalizePath(segments.join('/')) + fixLocaleParam(req, lang);
};

const dropPathLanguageAndRedirect = (req, res, lang) => {
  const trimmedUrl = dropPathLanguageAndFixLocaleParam(req, lang);
  res.redirect(trimmedUrl);
};

const fixLocaleParamAndRedirect = (req, res, lang) => {
  const fixedUrl = normalizePath(req.path) + fixLocaleParam(req, lang);
  res.redirect(fixedUrl);
};

export default function legacyUrlMiddleware(req, res, next) {
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
      legacyParamParser(req.query, config).then(url => res.redirect(url));
    } else if (LEGACY_LOCALES.includes(lang)) {
      dropPathLanguageAndRedirect(req, res, lang);
    } else {
      const { locale } = req.query;
      const cookieLang = req.cookies.lang;

      if (cookieLang && locale && cookieLang !== locale) {
        fixLocaleParamAndRedirect(req, res, cookieLang);
      } else {
        next();
      }
    }
  } else {
    next();
  }
}
