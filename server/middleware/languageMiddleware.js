import { getConfiguration } from '../configs/config.js';
import normalizePath, {
  pathSegments,
} from '../../utils/shared/normalizePath.js';
import { addQueryParams, getSearchParams } from '../../utils/shared/path.js';
import { languageFromPath } from '../../utils/shared/languageUtils.js';

/** Reittiopas-era link prefixes, stripped when `config.redirectReittiopasParams` is set. */
const LEGACY_LANGUAGE_PATH_SEGMENTS = Object.freeze([
  'fi',
  'en',
  'sv',
  'ru',
  'slangi',
]);

/**
 * Serves non-default languages under a persistent `/{lang}/` prefix and the
 * default language unprefixed. A `/{defaultLanguage}/...` path gets a
 * permanent redirect to the same path without the prefix, and a legacy
 * reittiopas prefix a temporary one. Sets the page language in
 * `res.locals.language`.
 */
export default function languageMiddleware(req, res, next) {
  const config = getConfiguration(req);
  const [firstSegment, ...rest] = pathSegments(req.path);

  const unprefixedUrl = () =>
    addQueryParams(
      normalizePath(rest.join('/')),
      getSearchParams(req.originalUrl),
    );

  if (firstSegment === config.defaultLanguage) {
    res.redirect(301, unprefixedUrl());
    return;
  }

  const isLegacy =
    config.redirectReittiopasParams &&
    !config.availableLanguages.includes(firstSegment) &&
    LEGACY_LANGUAGE_PATH_SEGMENTS.includes(firstSegment);
  if (isLegacy) {
    res.redirect(302, unprefixedUrl());
    return;
  }

  res.locals.language = languageFromPath(config, req.path);
  next();
}
