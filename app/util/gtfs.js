export const typeToName = {
  0: 'tram',
  1: 'subway',
  2: 'rail',
  3: 'bus',
  4: 'ferry',
  7: 'funicular',
  109: 'rail',
};

/**
 * Splits a gtfsId string into feedId and entityId, feedId cannot contain a colon
 * @param {string} [gtfsId] gtfsId of the entity in format FeedId:EntityId
 * @returns {{feedId?: string, entityId?: string}}
 * @throws Will throw an error if the gtfsId is not valid
 */
export function splitGtfsId(gtfsId) {
  if (!gtfsId) {
    return {};
  }
  const i = gtfsId.indexOf(':');
  if (i === -1) {
    throw new Error('GtfsId needs to be formatted as feedId:entityId');
  }
  return {
    feedId: gtfsId.slice(0, i),
    entityId: gtfsId.slice(i + 1, gtfsId.length),
  };
}
