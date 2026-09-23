import {
  getStopMarkerAnalytics,
  getStopMarkerPath,
} from '../../../../../../app/component/map/non-tile-layer/StopMarker';

describe('StopMarker', () => {
  describe('getStopMarkerAnalytics', () => {
    it('should create an analytics event for a normal map path', () => {
      expect(getStopMarkerAnalytics('/fi/', 'fi', 'BUS')).toEqual({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: 'BUS',
        context: 'index',
      });
    });

    it('should use the path prefix as context outside the index path', () => {
      expect(getStopMarkerAnalytics('/tampere/stops', 'fi', 'TRAM')).toEqual({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: 'TRAM',
        context: 'tampere',
      });
    });

    it('should not create analytics for bike or walk paths', () => {
      expect(getStopMarkerAnalytics('/bike/', 'fi', 'BUS')).toBeNull();
      expect(getStopMarkerAnalytics('/walk/', 'fi', 'BUS')).toBeNull();
    });
  });

  describe('getStopMarkerPath', () => {
    it('should encode the stop id in the stop page path', () => {
      expect(getStopMarkerPath('HSL:1541157')).toBe('/pysakit/HSL%3A1541157');
    });
  });
});
