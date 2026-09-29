import { getIconMarkerOptions } from '../../../../app/component/map/LocationMarker';

describe('<LocationMarker />', () => {
  it('should use a large icon size', () => {
    const { icon } = getIconMarkerOptions({ isLarge: true, type: 'to' });
    expect(icon.iconSize).toEqual([30, 30]);
    expect(icon.iconAnchor).toEqual([15, 30]);
  });

  it('should apply the className based on type', () => {
    const options = getIconMarkerOptions({ type: 'from' });
    expect(options.className).toBe('from');
    expect(options.icon.className).toBe('from');
  });

  it('should include the given className', () => {
    const options = getIconMarkerOptions({ className: 'foobar' });
    expect(options.className).toContain('foobar');
    expect(options.icon.className).toContain('foobar');
  });

  it('should construct the img id based on type', () => {
    const { icon } = getIconMarkerOptions({ type: 'to' });
    expect(icon.element.props.img).toBe('icon_mapMarker-map');
  });
});
