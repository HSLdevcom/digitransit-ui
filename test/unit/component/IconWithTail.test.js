import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IconWithTail from '../../../app/component/IconWithTail';

describe('<IconWithTail />', () => {
  it('should render correct svg when allVehicles is false', () => {
    const props = {
      rotate: 180,
    };
    const wrapper = shallowWithIntl(<IconWithTail {...props} />);

    expect(wrapper.find('use').at(0).prop('xlinkHref')).to.equal(
      '#icon-icon_vehicle-live-marker',
    );
  });

  describe('allVehicles is true', () => {
    it('should use right image when useLargeIcon is true and render vehicle number', () => {
      const props = {
        rotate: 180,
        vehicleNumber: '32',
        useLargeIcon: true,
      };
      const wrapper = shallowWithIntl(<IconWithTail {...props} />);

      expect(wrapper.find('use').at(0).prop('xlinkHref')).to.equal(
        '#icon-icon_all-vehicles-shadow',
      );

      expect(wrapper.find('use').at(1).prop('xlinkHref')).to.equal(
        '#icon-icon_all-vehicles-large',
      );

      expect(wrapper.find('tspan').text()).to.equal('32');
    });

    it('should use right image when useLargeIcon is false', () => {
      const props = {
        rotate: 180,
      };
      const wrapper = shallowWithIntl(<IconWithTail {...props} />);

      expect(wrapper.find('use').prop('xlinkHref')).to.equal(
        '#icon-icon_all-vehicles-small',
      );
    });
  });
});
