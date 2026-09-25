import {
  getStopMarkerAnalytics,
  getStopMarkerPath,
  getModeIconSize,
  getModeIconClassName,
  getStopIconRadii,
  buildStopIconSvg,
  getStopIconClassName,
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

  describe('getModeIconSize', () => {
    const config = {
      stopsSmallMaxZoom: 14,
      stopsIconSize: { small: 12, selected: 24, default: 18 },
    };

    it('should return the small size below the small max zoom', () => {
      expect(getModeIconSize(10, config, false)).to.equal(12);
    });

    it('should return the selected size when selected above the small max zoom', () => {
      expect(getModeIconSize(16, config, true)).to.equal(24);
    });

    it('should return the default size otherwise', () => {
      expect(getModeIconSize(16, config, false)).to.equal(18);
    });
  });

  describe('getModeIconClassName', () => {
    const config = { stopsIconSize: { small: 12, selected: 24, default: 18 } };

    it('should mark the icon small when the size matches the small size', () => {
      expect(getModeIconClassName('BUS', 12, config, false, false)).to.equal(
        'cursor-pointer BUS small',
      );
    });

    it('should mark the icon selected and border-disabled when requested', () => {
      expect(getModeIconClassName('BUS', 18, config, true, true)).to.equal(
        'cursor-pointer BUS selected disable-icon-border',
      );
    });
  });

  describe('getStopIconRadii', () => {
    it('should scale up the radii for a transfer or selected stop', () => {
      const normal = getStopIconRadii(15, {
        limitZoom: undefined,
        transfer: false,
        selected: false,
      });
      const transfer = getStopIconRadii(15, {
        limitZoom: undefined,
        transfer: true,
        selected: false,
      });
      expect(transfer.radius).to.be.above(normal.radius);
      expect(transfer.inner).to.be.above(normal.inner);
    });

    it('should cap the effective zoom to limitZoom when provided', () => {
      const limited = getStopIconRadii(20, {
        limitZoom: 12,
        transfer: false,
        selected: false,
      });
      const unlimited = getStopIconRadii(20, {
        limitZoom: undefined,
        transfer: false,
        selected: false,
      });
      expect(limited.radius).to.be.below(unlimited.radius);
    });
  });

  describe('buildStopIconSvg', () => {
    it('should return an empty string when the radius is zero', () => {
      expect(
        buildStopIconSvg({
          radius: 0,
          inner: 0,
          stroke: 0,
          appendClass: '',
          colorOverride: undefined,
          platformCode: undefined,
        }),
      ).to.equal('');
    });

    it('should not render a color attribute when there is no color override', () => {
      const svg = buildStopIconSvg({
        radius: 10,
        inner: 5,
        stroke: 2,
        appendClass: 'foo',
        colorOverride: undefined,
        platformCode: undefined,
      });
      expect(svg).to.not.contain('color=');
    });

    it('should omit appendClass when it is undefined', () => {
      const svg = buildStopIconSvg({
        radius: 10,
        inner: 5,
        stroke: 2,
        colorOverride: undefined,
        platformCode: undefined,
      });
      expect(svg).to.contain('class="stop"');
      expect(svg).to.not.contain('undefined');
    });

    it('should render a color attribute when a color override is given', () => {
      const svg = buildStopIconSvg({
        radius: 10,
        inner: 5,
        stroke: 2,
        appendClass: 'foo',
        colorOverride: '#ff0000',
        platformCode: undefined,
      });
      expect(svg).to.contain('color="#ff0000"');
    });

    it('should render the platform code label when there is enough room', () => {
      const svg = buildStopIconSvg({
        radius: 10,
        inner: 8,
        stroke: 2,
        appendClass: 'foo',
        colorOverride: undefined,
        platformCode: '3',
      });
      expect(svg).to.contain('>3</text>');
    });

    it('should not render the platform code label when there is not enough room', () => {
      const svg = buildStopIconSvg({
        radius: 10,
        inner: 5,
        stroke: 2,
        appendClass: 'foo',
        colorOverride: undefined,
        platformCode: '3',
      });
      expect(svg).to.not.contain('<text');
    });
  });

  describe('getStopIconClassName', () => {
    it('should combine the mode and cursor-pointer classes', () => {
      expect(getStopIconClassName('BUS', false)).to.equal('BUS cursor-pointer');
    });

    it('should add disable-icon-border when requested', () => {
      expect(getStopIconClassName('BUS', true)).to.equal(
        'BUS cursor-pointer disable-icon-border',
      );
    });
  });
});
