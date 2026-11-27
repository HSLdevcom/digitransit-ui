import L from 'leaflet';
import { LeafletProvider } from 'react-leaflet/es/context';
import { renderWithProviders } from '../../../helpers/mock-providers';
import Line from '../../../../../src/client/component/map/Line';

const geometry = [
  { lat: 60.1, lon: 24.9 },
  { lat: 60.2, lon: 25.0 },
];

describe('<Line />', () => {
  let map;

  beforeEach(() => {
    map = L.map(document.createElement('div'), {
      center: [60.1, 24.9],
      zoom: 12,
      // jsdom is not detected as SVG capable, so the default renderer would be missing
      renderer: new L.SVG(),
    });
  });

  afterEach(() => {
    map.remove();
  });

  const renderLine = props => {
    const result = renderWithProviders(
      <LeafletProvider value={{ map }}>
        <Line mode="bus" geometry={geometry} {...props} />
      </LeafletProvider>,
    );
    const layers = [];
    map.eachLayer(layer => layer instanceof L.Polyline && layers.push(layer));
    return {
      ...result,
      halo: layers.find(l => l.options.className.includes('leg-halo')),
      leg: layers.find(l => !l.options.className.includes('leg-halo')),
      layers,
    };
  };

  it('draws a halo and a leg polyline along the geometry', () => {
    const { halo, leg, layers } = renderLine({ color: '#ff0000' });
    expect(layers).toHaveLength(2);
    expect(leg.options.color).toBe('#ff0000');
    expect(leg.getLatLngs().map(p => [p.lat, p.lng])).toEqual([
      [60.1, 24.9],
      [60.2, 25.0],
    ]);
    expect(halo.getLatLngs()).toHaveLength(2);
  });

  it('accepts [lat, lon] pairs and drops invalid points', () => {
    const { leg } = renderLine({
      geometry: [[60.1, 24.9], { lat: 'x', lon: 1 }, [60.2, 25.0], [null, 3]],
    });
    expect(leg.getLatLngs()).toHaveLength(2);
  });

  it.each([[[]], [[{ lat: 'x', lon: 'y' }]]])('renders nothing for geometry %j', geom => {
    const { container, layers } = renderLine({ geometry: geom });
    expect(container.innerHTML).toBe('');
    expect(layers).toHaveLength(0);
  });

  it('falls back to currentColor and applies mode and modifier classes', () => {
    const { leg } = renderLine({ thin: true, appendClass: 'call-local' });
    expect(leg.options.color).toBe('currentColor');
    expect(leg.options.className).toBe('leg bus thin map-line call-local');
  });

  describe('weights', () => {
    const weights = props => {
      const { halo, leg, unmount } = renderLine(props);
      const result = [halo.options.weight, leg.options.weight];
      unmount();
      return result;
    };

    it('uses the configured weights', () => {
      expect(weights({})).toEqual([7, 6]);
      expect(weights({ thin: true })).toEqual([2, 2]);
    });

    it('narrows walking legs', () => {
      expect(weights({ mode: 'walk' })[1]).toBeCloseTo(4.8);
      expect(weights({ mode: 'walk-inside' })[1]).toBeCloseTo(4.8);
    });

    it('narrows external ferry lines', () => {
      const [haloWeight, legWeight] = weights({ mode: 'ferry-external' });
      expect(haloWeight).toBeCloseTo(4.2);
      expect(legWeight).toBeCloseTo(3.6);
    });

    it('narrows opaque lines', () => {
      const [haloWeight, legWeight] = weights({ opaque: true });
      expect(haloWeight).toBeCloseTo(4.55);
      expect(legWeight).toBeCloseTo(3);
    });
  });

  it('draws passive lines thinner and in the passive color', () => {
    const { halo, leg } = renderLine({ passive: true, color: '#ff0000' });
    expect(leg.options.color).toBe('#758993');
    expect(halo.options.weight).toBeCloseTo(3.5);
    expect(leg.options.weight).toBeCloseTo(3);
  });

  it('keeps thin lines behind a normal line drawn earlier', () => {
    renderLine({ mode: 'walk' });
    renderLine({ mode: 'bus', thin: true });
    const classes = [...map.getPane('overlayPane').querySelectorAll('path')].map(p =>
      p.getAttribute('class'),
    );
    const firstThin = classes.findIndex(c => c.includes('thin'));
    const lastNormal = classes.map(c => c.includes('walk')).lastIndexOf(true);
    expect(firstThin).toBeLessThan(lastNormal);
  });
});
