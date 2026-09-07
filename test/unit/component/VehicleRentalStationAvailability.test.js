import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import VehicleRentalAvailability from '../../../app/component/VehicleRentalAvailability';

describe('<VehicleRentalStationAvailability />', () => {
  it('should render CityBikeAvailability with valid props', () => {
    const props = {
      vehiclesAvailable: 1,
      totalSpaces: 3,
      fewAvailableCount: 3,
      fewerAvailableCount: 2,
      type: 'citybike',
      useSpacesAvailable: true,
    };
    const { container } = renderWithProviders(
      <VehicleRentalAvailability {...props} />,
    );
    expect(container.querySelector('.availability-container')).to.not.equal(
      null,
    );
    expect(container.querySelectorAll('.availability-header')).to.have.lengthOf(
      1,
    );
  });
});
