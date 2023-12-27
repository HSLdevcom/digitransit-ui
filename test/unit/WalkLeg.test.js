import React from 'react';
import { FormattedMessage } from 'react-intl';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import WalkLeg from '../../app/component/WalkLeg';
import { CityBikeNetworkType } from '../../app/util/vehicleRentalUtils';
import ServiceAlertIcon from '../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../app/constants';

describe('<WalkLeg />', () => {
  it('should show the leg starting point name', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
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
        endTime: 1529589701000,
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
      context: {
        config: {},
      },
    });

    expect(wrapper.find('.itinerary-leg-row').text()).to.contain('Veturitori');
  });

  it('should tell the user to return a rented bike to the starting point station', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
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
        endTime: 1529589701000,
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
        endTime: 1529589701000,
        to: {
          name: 'Mannerheimin tie 1',
          stop: null,
        },
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
      context: {
        config: {},
      },
    });

    expect(wrapper.find(FormattedMessage).at(0).prop('id')).to.equal(
      'return-cycle-to',
    );
  });

  it('should tell the user to return a rented kick scooter to the starting point station', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
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
        endTime: 1529589701000,
      },
      previousLeg: {
        distance: 3297.017000000001,
        duration: 904,
        from: {
          vehicleRentalStation: {
            network: 'foobar',
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
        endTime: 1529589701000,
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

    expect(wrapper.find(FormattedMessage).at(0).prop('id')).to.equal(
      'return-scooter-to',
    );
  });

  it('should show a service alert icon if there is one at the "from" stop', () => {
    const startTime = 1529589709000;
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
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
            gtfsId: 'HSL:10000',
          },
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime,
        endTime: 1529589701000,
      },
    };

    const wrapper = shallowWithIntl(<WalkLeg {...props} />, {
      context: { config: { colors: { primary: '#007ac9' } } },
    });

    expect(wrapper.find(ServiceAlertIcon).prop('severityLevel')).to.equal(
      AlertSeverityLevelType.Info,
    );
  });

  it('should render with leg.{from,to}.stop.vehicleMode being null', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      index: 1,
      leg: {
        distance: 1.23,
        duration: 34,
        from: {
          name: 'Foo',
          stop: {
            gtfsId: 'foo',
            vehicleMode: null,
          },
        },
        to: {
          name: 'Bar',
          stop: {
            gtfsId: 'bar',
            vehicleMode: null,
          },
        },
        mode: 'WALK',
        rentedBike: false,
        startTime: 1668600030868,
        endTime: 1668600108525,
      },
    };

    shallowWithIntl(<WalkLeg {...props} />, {
      context: { config: { colors: { primary: '#007ac9' } } },
    });
  });
});
