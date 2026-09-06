import { splitGtfsId } from '../../../app/util/gtfs';

describe('splitGtfsId', () => {
  it('should split gtfsId into feedId and entityId', () => {
    const gtfsId = 'FOO:BAR:1234';
    const { feedId, entityId } = splitGtfsId(gtfsId);
    expect(feedId).toBe('FOO');
    expect(entityId).toBe('BAR:1234');
  });

  it('should return an empty object on undefined', () => {
    const { feedId, entityId } = splitGtfsId();
    expect(feedId).toBe(undefined);
    expect(entityId).toBe(undefined);
  });

  it('should throw an error if colon is missing', () => {
    expect(() => {
      splitGtfsId('no colon');
    }).toThrow(Error);
  });
});
