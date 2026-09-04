import React from 'react';
import SelectVehicleRentalRow from '../../../../../app/component/map/tile-layer/SelectVehicleRentalRow';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { mockContext } from '../../../helpers/mock-context';

describe('<SelectVehicleRentalRow />', () => {
  it('should use the citybike icon by default', () => {
    const props = {
      name: 'foobar',
      network: 'some_network',
      id: '001',
      prefix: 'citybike',
    };
    const { container } = renderWithProviders(
      <SelectVehicleRentalRow {...props} />,
      { config: { ...mockContext.config, colors: { iconColors: {} } } },
    );
    const use = container.querySelector('use');
    expect(use.getAttribute('xlink:href')).to.contain('citybike');
  });

  it('should use the configured icon for the network', () => {
    const props = {
      name: 'foobar',
      network: 'scooter_network',
      id: '001',
      prefix: 'citybike',
    };
    const { container } = renderWithProviders(
      <SelectVehicleRentalRow {...props} />,
      {
        config: {
          ...mockContext.config,
          ...mockContext.config,
          vehicleRental: {
            networks: { scooter_network: { icon: 'scooter' } },
          },
          colors: { iconColors: {} },
        },
      },
    );
    const use = container.querySelector('use');
    expect(use.getAttribute('xlink:href')).to.contain('scooter');
  });
});
