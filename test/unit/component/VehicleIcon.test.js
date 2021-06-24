import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import VehicleIcon from '../../../app/component/VehicleIcon';

describe('<VehicleIcon />', () => {
  it('should render correct svg when allVehicles is false', () => {
    const props = {
      rotate: 180,
      useLargeIcon: true,
    };
    const wrapper = shallowWithIntl(<VehicleIcon {...props} />);

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
      const wrapper = shallowWithIntl(<VehicleIcon {...props} />);

      expect(wrapper.find('use').at(0).prop('xlinkHref')).to.equal(
        '#icon-icon_vehicle-live-marker',
      );

      expect(wrapper.find('tspan').text()).to.equal('32');
    });

    it('should use right image when useLargeIcon is false', () => {
      const props = {
        rotate: 180,
      };
      const wrapper = shallowWithIntl(<VehicleIcon {...props} />);

      expect(wrapper.find('use').prop('xlinkHref')).to.equal(
        '#icon-icon_vehicle-live-marker',
      );
    });
  });
});
