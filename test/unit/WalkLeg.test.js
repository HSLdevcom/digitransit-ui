import React from 'react';
import { FormattedMessage } from 'react-intl';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import WalkLeg from '../../app/component/WalkLeg';
import { CityBikeNetworkType } from '../../app/util/citybikes';
import ServiceAlertIcon from '../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../app/constants';

describe('<WalkLeg />', () => {
  it('should show the leg starting point name', () => {
    const props = {
      focusAction: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime: 1529589709000,
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
      context: {
        config: {},
      },
    });

    expect(wrapper.find('.itinerary-leg-first-row>div').text()).to.contain(
      'Veturitori',
    );
  });

  it('should tell the user to return a rented bike to the starting point station', () => {
    const props = {
      focusAction: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime: 1529589709000,
      },
      previousLeg: {
        distance: 3297.017000000001,
        duration: 904,
        from: {
          name: 'Kaisaniemenpuisto',
          stop: null,
        },
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 1529588805000,
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
      context: {
        config: {},
      },
    });

    expect(
      wrapper
        .find(FormattedMessage)
        .at(0)
        .prop('id'),
    ).to.equal('return-cycle-to');
  });

  it('should tell the user to return a rented kick scooter to the starting point station', () => {
    const props = {
      focusAction: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime: 1529589709000,
      },
      previousLeg: {
        distance: 3297.017000000001,
        duration: 904,
        from: {
          bikeRentalStation: {
            networks: ['foobar'],
          },
          name: 'Kaisaniemenpuisto',
          stop: null,
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 1529588805000,
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
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
        .at(0)
        .prop('id'),
    ).to.equal('return-scooter-to');
  });

  it('should show a service alert icon if there is one at the "from" stop', () => {
    const startTime = 1529589709000;
    const props = {
      focusAction: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
                effectiveEndDate: startTime / 1000 + 1,
                effectiveStartDate: startTime / 1000 - 1,
              },
            ],
          },
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime,
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
      context: { config: {} },
    });

    expect(wrapper.find(ServiceAlertIcon).prop('severityLevel')).to.equal(
      AlertSeverityLevelType.Info,
    );
  });
});
