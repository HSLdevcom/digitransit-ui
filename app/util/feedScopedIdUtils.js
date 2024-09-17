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
  return feedScopedId.split(':')[1];
};

/**
 * Returns feedId without the objectId.
 *
 * @param {String} feedScopedId should be in feedId:objectId format.
 */
export const getFeedWithoutId = feedScopedId => {
  if (!feedScopedId) {
    return undefined;
  }
  if (feedScopedId.indexOf(':') === -1) {
    return feedScopedId;
  }
  return feedScopedId.split(':')[0];
};

/**
 * Returns boolean indicating whether the feed is external or not.
 */
export const isExternalFeed = (feedId, config) => {
  return (
    config.internalFeedIds !== undefined &&
    feedId !== undefined &&
    !config.internalFeedIds.includes(feedId)
  );
};
