import React from 'react';
import { screen } from '@testing-library/react';
import { Component as RentalVehiclePageMapContainer } from '../../../app/component/RentalVehiclePageMapContainer';
import { renderWithProviders } from '../helpers/mock-providers';

// The map itself isn't under test, only the name passed to it
vi.mock('../../../app/component/map/StopPageMap', () => ({
  // eslint-disable-next-line react/prop-types
  default: ({ stopName }) => <div>{stopName}</div>,
}));

describe('<RentalVehiclePageMapContainer />', () => {
  it('shows a translated name for a scooter', () => {
    renderWithProviders(
      <RentalVehiclePageMapContainer
        rentalVehicle={{ lat: 60.17, lon: 24.94, name: 'scooter' }}
      />,
    );
    expect(screen.getByText('Electric scooter')).toBeTruthy();
  });

  it('shows the vehicle name for other vehicles', () => {
    renderWithProviders(
      <RentalVehiclePageMapContainer
        rentalVehicle={{ lat: 60.17, lon: 24.94, name: 'Voi' }}
      />,
    );
    expect(screen.getByText('Voi')).toBeTruthy();
  });
});
