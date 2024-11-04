/* eslint-disable import/prefer-default-export */

/**
 * Returns id without the feedId prefix.
 *
 * @param {String} feedScopedId should be in feedId:objectId format.
 */
export const getIdWithoutFeed = feedScopedId => {
  if (!feedScopedId) {
    return undefined;
  }
  if (feedScopedId.indexOf(':') === -1) {
    return feedScopedId;
  }
  return feedScopedId.substring(feedScopedId.indexOf(':') + 1);
};
