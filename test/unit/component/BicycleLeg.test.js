import React from 'react';
import { FormattedMessage } from 'react-intl';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import BicycleLeg from '../../../app/component/BicycleLeg';
import { CityBikeNetworkType } from '../../../app/util/citybikes';

describe('<BicycleLeg />', () => {
  it('should guide the user to rent a citybike', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 0,
        endTime: 0,
        from: {
          name: 'Hertanmäenkatu',
          bikeRentalStation: {
            bikesAvailable: 0,
            networks: ['foobar'],
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
      startTime: 0,
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: CityBikeNetworkType.CityBike } },
          },
        },
      },
    });
    expect(wrapper.find(FormattedMessage).at(0).prop('id')).to.equal(
      'rent-citybike-at',
    );
  });

  it('should guide the user to rent a scooter', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 0,
        endTime: 0,
        from: {
          name: 'Hertanmäenkatu',
          bikeRentalStation: {
            bikesAvailable: 0,
            networks: ['foobar'],
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
      startTime: 0,
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: CityBikeNetworkType.Scooter } },
          },
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
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 0,
        endTime: 0,
        from: {
          name: 'Hertanmäenkatu',
          bikeRentalStation: {
            bikesAvailable: 0,
            networks: ['foobar'],
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
      startTime: 0,
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: CityBikeNetworkType.CityBike } },
          },
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
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 0,
        endTime: 0,
        from: {
          name: 'Hertanmäenkatu',
          bikeRentalStation: {
            bikesAvailable: 0,
            networks: ['foobar'],
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
      startTime: 0,
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: CityBikeNetworkType.Scooter } },
          },
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
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'WALK',
        rentedBike: true,
        startTime: 0,
        endTime: 0,
        from: {
          name: 'Hertanmäenkatu',
          bikeRentalStation: {
            bikesAvailable: 0,
            networks: ['foobar'],
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
      startTime: 0,
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: CityBikeNetworkType.CityBike } },
          },
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
      index: 1,
      leg: {
        distance: 0,
        duration: 0,
        mode: 'WALK',
        rentedBike: true,
        startTime: 0,
        endTime: 0,
        from: {
          name: 'Hertanmäenkatu',
          bikeRentalStation: {
            bikesAvailable: 0,
            networks: ['foobar'],
          },
        },
        to: {
          name: 'Testipaikka',
        },
      },
      startTime: 0,
    };
    const wrapper = shallowWithIntl(<BicycleLeg {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { type: CityBikeNetworkType.Scooter } },
          },
        },
      },
    });
    expect(wrapper.find(FormattedMessage).at(1).prop('id')).to.equal(
      'scooterwalk-distance-duration',
    );
  });
});
