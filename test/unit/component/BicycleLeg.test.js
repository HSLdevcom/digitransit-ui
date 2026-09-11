import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import BicycleLeg from '../../../app/component/itinerary/BicycleLeg';
import { RentalNetworkType } from '../../../app/util/vehicleRentalUtils';

const baseConfig = {
  ...mockContext.config,
  defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
  defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
};

describe('<BicycleLeg />', () => {
  it('should guide the user to rent a citybike', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        start: { scheduledTime: new Date().toISOString() },
        end: { scheduledTime: new Date().toISOString() },
        from: {
          name: 'Hertanmäenkatu',
          vehicleRentalStation: {
            vehiclesAvailable: 0,
            availableVehicles: { total: 0 },
            rentalNetwork: { networkId: 'foobar' },
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const { container } = renderWithProviders(<BicycleLeg {...props} />, {
      config: {
        ...baseConfig,
        vehicleRental: {
          networks: { foobar: { type: RentalNetworkType.CityBike } },
        },
      },
    });
    expect(container.textContent).to.contain('Fetch a city bike:');
    expect(container.textContent).to.contain('Hertanmäenkatu');
  });

  it('should guide the user to rent a scooter', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        start: { scheduledTime: new Date().toISOString() },
        end: { scheduledTime: new Date().toISOString() },
        from: {
          name: 'Hertanmäenkatu',
          vehicleRentalStation: {
            vehiclesAvailable: 0,
            availableVehicles: { total: 0 },
            rentalNetwork: { networkId: 'foobar' },
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const { container } = renderWithProviders(<BicycleLeg {...props} />, {
      config: {
        ...baseConfig,
        vehicleRental: {
          networks: { foobar: { type: RentalNetworkType.Scooter } },
        },
      },
    });
    expect(container.textContent).to.contain(
      'Use an app to unlock the electric scooter',
    );
  });

  it('should guide the user to ride a bike', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        start: { scheduledTime: new Date().toISOString() },
        end: { scheduledTime: new Date().toISOString() },
        from: {
          name: 'Hertanmäenkatu',
          vehicleRentalStation: {
            vehiclesAvailable: 0,
            availableVehicles: { total: 0 },
            rentalNetwork: { networkId: 'foobar' },
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const { container } = renderWithProviders(<BicycleLeg {...props} />, {
      config: {
        ...baseConfig,
        vehicleRental: {
          networks: { foobar: { type: RentalNetworkType.CityBike } },
        },
      },
    });
    expect(container.textContent).to.contain('Cycle');
  });

  it('should guide the user to ride a scooter', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        start: { scheduledTime: new Date().toISOString() },
        end: { scheduledTime: new Date().toISOString() },
        from: {
          name: 'Hertanmäenkatu',
          vehicleRentalStation: {
            vehiclesAvailable: 0,
            availableVehicles: { total: 0 },
            rentalNetwork: { networkId: 'foobar' },
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const { container } = renderWithProviders(<BicycleLeg {...props} />, {
      config: {
        ...baseConfig,
        vehicleRental: {
          networks: { foobar: { type: RentalNetworkType.Scooter } },
        },
      },
    });
    expect(container.textContent).to.contain('Travel by scooter');
  });

  it('should guide the user to walk a bike', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'WALK',
        rentedBike: true,
        start: { scheduledTime: new Date().toISOString() },
        end: { scheduledTime: new Date().toISOString() },
        from: {
          name: 'Hertanmäenkatu',
          vehicleRentalStation: {
            vehiclesAvailable: 0,
            availableVehicles: { total: 0 },
            rentalNetwork: { networkId: 'foobar' },
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const { container } = renderWithProviders(<BicycleLeg {...props} />, {
      config: {
        ...baseConfig,
        vehicleRental: {
          networks: { foobar: { type: RentalNetworkType.CityBike } },
        },
      },
    });
    expect(container.textContent).to.contain('Walk your bike');
  });

  it('should guide the user to walk a scooter', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      openSettings: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'WALK',
        rentedBike: true,
        start: { scheduledTime: new Date().toISOString() },
        end: { scheduledTime: new Date().toISOString() },
        from: {
          name: 'Hertanmäenkatu',
          vehicleRentalStation: {
            vehiclesAvailable: 0,
            availableVehicles: { total: 0 },
            rentalNetwork: { networkId: 'foobar' },
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const { container } = renderWithProviders(<BicycleLeg {...props} />, {
      config: {
        ...baseConfig,
        vehicleRental: {
          networks: { foobar: { type: RentalNetworkType.Scooter } },
        },
      },
    });
    expect(container.textContent).to.contain('Walk your kick scooter');
  });
});
