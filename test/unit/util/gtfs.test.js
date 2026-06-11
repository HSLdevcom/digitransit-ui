import { splitGtfsId } from '../../../app/util/gtfs';

describe('splitGtfsId', () => {
  it('should split gtfsId into feedId and entityId', () => {
    const gtfsId = 'FOO:BAR:1234';
    const { feedId, entityId } = splitGtfsId(gtfsId);
    expect(feedId).to.equal('FOO');
    expect(entityId).to.equal('BAR:1234');
  });

  it('should return an empty object on undefined', () => {
    const { feedId, entityId } = splitGtfsId();
    expect(feedId).to.equal(undefined);
    expect(entityId).to.equal(undefined);
  });

  it('should throw an error if colon is missing', () => {
    expect(() => {
      splitGtfsId('no colon');
    }).to.throw(Error);
  });
});
