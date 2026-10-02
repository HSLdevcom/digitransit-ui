import React from 'react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { createTestConfig } from '../../../helpers/mock-context';
import SelectVehicleRentalClusterRow from '../../../../../app/component/map/tile-layer/SelectRentalVehicleClusterRow';

const baseConfig = createTestConfig();

const baseProps = {
  name: 'Cluster A',
  id: 'foo:1',
  prefix: 'scooters',
  networks: ['foo'],
};

describe('<SelectVehicleRentalClusterRow />', () => {
  it('renders the cluster name', () => {
    const { container } = renderWithProviders(
      <SelectVehicleRentalClusterRow {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.textContent).toContain('Cluster A');
  });

  it('applies the configured citybike color by default', () => {
    const { container } = renderWithProviders(
      <SelectVehicleRentalClusterRow {...baseProps} />,
      { config: baseConfig },
    );
    expect(container.querySelector('svg')?.style.fill).toBe(
      baseConfig.colors.citybike,
    );
  });

  it('applies the configured scooter color when isScooter is set', () => {
    const { container } = renderWithProviders(
      <SelectVehicleRentalClusterRow {...baseProps} isScooter />,
      { config: baseConfig },
    );
    expect(container.querySelector('svg')?.style.fill).toBe(
      baseConfig.colors.scooter,
    );
  });
});
