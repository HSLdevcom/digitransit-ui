/**
 * Returns boolean indicating whether the feed is external or not.
 */
export const isExternalFeed = (feedId, config) => {
  return (
    config !== undefined &&
    config.externalFeedIds !== undefined &&
    feedId !== undefined &&
    config.externalFeedIds.includes(feedId)
  );
};
