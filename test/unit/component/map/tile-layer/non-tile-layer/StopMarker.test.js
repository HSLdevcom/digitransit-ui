import {
  getStopMarkerAnalytics,
  getStopMarkerPath,
} from '../../../../../../app/component/map/non-tile-layer/StopMarker';

describe('StopMarker', () => {
  describe('getStopMarkerAnalytics', () => {
    it('should create an analytics event for a normal map path', () => {
      expect(getStopMarkerAnalytics('/fi/', 'fi', 'BUS')).to.deep.equal({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: 'BUS',
        context: 'index',
      });
    });

    it('should use the path prefix as context outside the index path', () => {
      expect(
        getStopMarkerAnalytics('/tampere/stops', 'fi', 'TRAM'),
      ).to.deep.equal({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: 'TRAM',
        context: 'tampere',
      });
    });

    it('should not create analytics for bike or walk paths', () => {
      expect(getStopMarkerAnalytics('/bike/', 'fi', 'BUS')).to.equal(null);
      expect(getStopMarkerAnalytics('/walk/', 'fi', 'BUS')).to.equal(null);
    });
  });

  describe('getStopMarkerPath', () => {
    it('should encode the stop id in the stop page path', () => {
      expect(getStopMarkerPath('HSL:1541157')).to.equal(
        '/pysakit/HSL%3A1541157',
      );
    });
  });
});
