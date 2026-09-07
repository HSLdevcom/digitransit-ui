import { expect } from 'chai';
import { getIconMarkerOptions } from '../../../../app/component/map/LocationMarker';

describe('<LocationMarker />', () => {
  it('should use a large icon size', () => {
    const { icon } = getIconMarkerOptions({ isLarge: true, type: 'to' });
    expect(icon.iconSize).to.deep.equal([30, 30]);
    expect(icon.iconAnchor).to.deep.equal([15, 30]);
  });

  it('should apply the className based on type', () => {
    const options = getIconMarkerOptions({ type: 'from' });
    expect(options.className).to.equal('from');
    expect(options.icon.className).to.equal('from');
  });

  it('should include the given className', () => {
    const options = getIconMarkerOptions({ className: 'foobar' });
    expect(options.className).to.include('foobar');
    expect(options.icon.className).to.include('foobar');
  });

  it('should construct the img id based on type', () => {
    const { icon } = getIconMarkerOptions({ type: 'to' });
    expect(icon.element.props.img).to.equal('icon_mapMarker-map');
  });
});
