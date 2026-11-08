import { getConfiguration } from '../configs/config.js';
import normalizePath, {
  pathSegments,
} from '../../utils/server/normalizePath.js';

/** Reittiopas-era link prefixes, stripped when `config.redirectReittiopasParams` is set. */
const LEGACY_LANGUAGE_PATH_SEGMENTS = Object.freeze([
  'fi',
  'en',
  'sv',
  'ru',
  'slangi',
]);

const LANGUAGE_COOKIE = 'lang';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** A language selector link (`/{lang}/...`), or an old reittiopas-era one. */
function isLanguagePathSegment(config, segment) {
  return (
    config.availableLanguages.includes(segment) ||
    (config.redirectReittiopasParams &&
      LEGACY_LANGUAGE_PATH_SEGMENTS.includes(segment))
  );
}

/**
 * Resolves the request's language: the chosen (cookie) language if it is
 * available, else `config.defaultLanguage`.
 */
export function resolveLanguage(config, req) {
  const cookieLang = req.cookies[LANGUAGE_COOKIE];
  return config.availableLanguages.includes(cookieLang)
    ? cookieLang
    : config.defaultLanguage;
}

/** Stores the chosen language for a year from the latest visit. */
function setLanguageCookie(req, res, language) {
  res.cookie(LANGUAGE_COOKIE, language, {
    maxAge: ONE_YEAR_MS,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: req.secure,
  });
}

/**
 * Stores a `/{lang}/...` language switch in a long-lived cookie (if the
 * language is available) and redirects to the same URL without the language
 * segment. Other requests refresh a valid cookie, clear an invalid one and get
 * their resolved language in `res.locals.language`.
 */
export default function languageMiddleware(req, res, next) {
  const config = getConfiguration(req);
  const [firstSegment, ...rest] = pathSegments(req.path);

  if (isLanguagePathSegment(config, firstSegment)) {
    if (config.availableLanguages.includes(firstSegment)) {
      setLanguageCookie(req, res, firstSegment);
    }
    const queryIndex = req.originalUrl.indexOf('?');
    const search = queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(`${normalizePath(rest.join('/'))}${search}`);
    return;
  }

  const cookieLang = req.cookies[LANGUAGE_COOKIE];
  if (config.availableLanguages.includes(cookieLang)) {
    setLanguageCookie(req, res, cookieLang);
  } else if (cookieLang !== undefined) {
    res.clearCookie(LANGUAGE_COOKIE, { path: '/' });
  }
  res.locals.language = resolveLanguage(config, req);
  res.vary('Cookie');
  next();
}
