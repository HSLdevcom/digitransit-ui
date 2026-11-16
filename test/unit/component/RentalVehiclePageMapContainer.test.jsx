import { screen } from '@testing-library/react';
import RentalVehiclePageMapContainer from '../../../app/component/RentalVehiclePageMapContainer';
import * as StopPageMapModule from '../../../app/component/map/StopPageMap';
import { renderWithProviders } from '../helpers/mock-providers';

// The map itself isn't under test, only the name passed to it
// eslint-disable-next-line react/prop-types
const StopPageMapStub = ({ stopName }) => <div>{stopName}</div>;

describe('<RentalVehiclePageMapContainer />', () => {
  beforeEach(() => {
    vi.spyOn(StopPageMapModule, 'default', 'get').mockReturnValue(
      StopPageMapStub,
    );
  });

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
