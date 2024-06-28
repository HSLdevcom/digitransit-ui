import React from 'react';
import { FormattedMessage } from 'react-intl';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import BicycleLeg from '../../../app/component/itinerary/BicycleLeg';
import { RentalNetworkType } from '../../../app/util/vehicleRentalUtils';

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
            network: 'foobar',
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: RentalNetworkType.CityBike } },
          },
          defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
          defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
        },
      },
    });
    expect(wrapper.find(FormattedMessage).at(0).prop('id')).to.equal(
      'rent-cycle-at',
    );
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
            network: 'foobar',
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: RentalNetworkType.Scooter } },
          },
          defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
          defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
        },
      },
    });
    expect(wrapper.find(FormattedMessage).at(0).prop('id')).to.equal(
      'rent-scooter-at',
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
            network: 'foobar',
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: RentalNetworkType.CityBike } },
          },
          defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
          defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
        },
      },
    });
    expect(
      wrapper
        .find(FormattedMessage)
        .find('[id="cycle-distance-duration"]')
        .exists(),
    ).to.equal(true);
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
            network: 'foobar',
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: RentalNetworkType.Scooter } },
          },
          defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
          defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
        },
      },
    });
    expect(
      wrapper
        .find(FormattedMessage)
        .find('[id="scooter-distance-duration"]')
        .exists(),
    ).to.equal(true);
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
            network: 'foobar',
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: RentalNetworkType.CityBike } },
          },
          defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
          defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
        },
      },
    });
    expect(wrapper.find(FormattedMessage).at(1).prop('id')).to.equal(
      'cyclewalk-distance-duration',
    );
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
            network: 'foobar',
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: RentalNetworkType.Scooter } },
          },
          defaultSettings: { walkSpeed: 1, bikeSpeed: 1 },
          defaultOptions: { walkSpeed: 1, bikeSpeed: 1 },
        },
      },
    });
    expect(wrapper.find(FormattedMessage).at(1).prop('id')).to.equal(
      'scooterwalk-distance-duration',
    );
  });
});
