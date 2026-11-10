import { PATH_SEPARATORS } from '../../utils/shared/normalizePath.js';
import { addQueryParams, getSearchParams } from '../../utils/shared/path.js';

/**
 * Permanently redirects a path with repeated slashes or backslashes
 * (`//sv/x`, `/sv\x`) to the path with single slashes (`/sv/x`), as browsers
 * read it and the client router can match it.
 */
export default function slashMiddleware(req, res, next) {
  const path = req.path.split(PATH_SEPARATORS).join('/');
  if (path === req.path) {
    next();
    return;
  }
  res.redirect(301, addQueryParams(path, getSearchParams(req.originalUrl)));
}
