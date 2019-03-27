import React from 'react';

import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import LocationMarker from '../../../../app/component/map/LocationMarker';

describe('<LocationMarker />', () => {
  it('should use a large icon size', () => {
    const props = {
      isLarge: true,
      position: {
        address: 'Katariina Saksilaisen katu 12, Helsinki',
        lat: 60.215977901541855,
        lon: 24.987739389762282,
      },
    };
    const wrapper = shallowWithIntl(<LocationMarker {...props} />);
    const { icon } = wrapper.props();
    expect(icon.iconSize).to.deep.equal([30, 30]);
    expect(icon.iconAnchor).to.deep.equal([15, 30]);
  });
});
