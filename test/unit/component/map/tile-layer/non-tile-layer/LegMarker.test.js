import {
  getLegMarkerIconName,
  shouldDisplayLegRouteNumber,
  getLegRouteNumberHtml,
} from '../../../../../../app/component/map/non-tile-layer/LegMarker';

describe('LegMarker', () => {
  describe('getLegMarkerIconName', () => {
    it('should use the bus icon for express buses', () => {
      expect(getLegMarkerIconName('bus-express')).to.equal('icon_bus');
    });

    it('should prefix the mode with icon_ for other modes', () => {
      expect(getLegMarkerIconName('rail')).to.equal('icon_rail');
      expect(getLegMarkerIconName('subway')).to.equal('icon_subway');
    });
  });

  describe('shouldDisplayLegRouteNumber', () => {
    it('should display the route number for a normal route', () => {
      expect(shouldDisplayLegRouteNumber({}, 'bus', '55')).to.equal(true);
    });

    it('should display the route number when the name is not empty even for external routes', () => {
      expect(
        shouldDisplayLegRouteNumber(
          { externalFeedIds: ['foo'] },
          'bus-external',
          '55',
        ),
      ).to.equal(true);
    });

    it('should hide an empty route number for an external route', () => {
      expect(
        shouldDisplayLegRouteNumber(
          { externalFeedIds: ['foo'] },
          'bus-external',
          '',
        ),
      ).to.equal(false);
    });

    it('should display an empty route number when externalFeedIds is not configured', () => {
      expect(shouldDisplayLegRouteNumber({}, 'bus-external', '')).to.equal(
        true,
      );
    });
  });

  describe('getLegRouteNumberHtml', () => {
    it('should return an empty string when the route number should not be displayed', () => {
      expect(getLegRouteNumberHtml('bus', 'U', false)).to.equal('');
    });

    it('should render the route number and a lower-cased screen reader label', () => {
      const html = getLegRouteNumberHtml('rail', 'U', true);
      expect(html).to.contain(
        '<span class="map-route-number rail" aria-hidden="true">U</span>',
      );
      expect(html).to.contain('<span class="sr-only">u</span>');
    });
  });
});
