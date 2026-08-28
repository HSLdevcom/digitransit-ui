import React from 'react';
import { render } from '@testing-library/react';
import VehicleIcon from '../../../app/component/VehicleIcon';

describe('<VehicleIcon />', () => {
  it('should render correct svg when allVehicles is false', () => {
    const props = {
      rotate: 180,
      useLargeIcon: true,
      vehicleNumber: 'P',
    };
    const { container } = render(<VehicleIcon {...props} />);
    expect(container.querySelector('use').getAttribute('xlink:href')).to.equal(
      '#icon_vehicle-live-marker',
    );
  });

  describe('allVehicles is true', () => {
    it('should use right image when useLargeIcon is true and render vehicle number', () => {
      const props = {
        rotate: 180,
        vehicleNumber: '32',
        useLargeIcon: true,
      };
      const { container } = render(<VehicleIcon {...props} />);
      expect(
        container.querySelector('use').getAttribute('xlink:href'),
      ).to.equal('#icon_vehicle-live-marker');
      expect(container.querySelector('tspan').textContent).to.equal('32');
    });

    it('should use right image when useLargeIcon is false', () => {
      const props = {
        rotate: 180,
        vehicleNumber: 'K',
      };
      const { container } = render(<VehicleIcon {...props} />);
      expect(
        container.querySelector('use').getAttribute('xlink:href'),
      ).to.equal('#icon_all-vehicles-small');
    });
  });
});
