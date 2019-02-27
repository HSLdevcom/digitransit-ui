import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mountWithIntl, shallowWithIntl } from './helpers/mock-intl-enzyme';
import Departure from '../../app/component/Departure';
import RouteDestination from '../../app/component/RouteDestination';

import data from './test-data/dt2734';
import {
  departure as exampleDeparture,
  realtimeDeparture,
} from '../../app/component/ExampleData';

describe('<Departure />', () => {
  it('should show trip headsign if no stop headsign present', () => {
    const props = {
      currentTime: Date.now(),
      useUTC: true,
      ...data.departureWithTripHeadsign,
    };
    const wrapper = mountWithIntl(<Departure {...props} />, {
      context: {
        config: { minutesToDepartureLimit: 9 },
      },
    });
    expect(wrapper.find('span.destination').text()).to.equal('Pirttiniemi');
  });

  it('should show trip headsign if no stop headsign present vol2', () => {
    const props = {
      currentTime: Date.now(),
      useUTC: true,
      departure: realtimeDeparture,
    };
    const wrapper = mountWithIntl(<Departure {...props} />, {
      context: {
        config: { minutesToDepartureLimit: 9 },
      },
    });
    expect(wrapper.find('span.destination').text()).to.equal('Rautatientori');
  });

  it('should show trip headsign if no stop headsign present vol3', () => {
    const props = {
      currentTime: Date.now(),
      useUTC: true,
      departure: exampleDeparture,
    };
    const wrapper = mountWithIntl(<Departure {...props} />, {
      context: {
        config: { minutesToDepartureLimit: 9 },
      },
    });
    expect(wrapper.find('span.destination').text()).to.equal('Pasila');
  });

  it('should show stop headsign if present', () => {
    const props = {
      currentTime: Date.now(),
      useUTC: true,
      ...data.departureWithStopHeadsign,
    };
    const wrapper = mountWithIntl(<Departure {...props} />, {
      context: {
        config: { minutesToDepartureLimit: 9 },
      },
    });
    expect(wrapper.find('span.destination').text()).to.equal('Keskusta');
  });

  it('should show long route name if nothing else present', () => {
    const props = {
      currentTime: Date.now(),
      useUTC: true,
      ...data.departureWithRouteLongName,
    };
    const wrapper = mountWithIntl(<Departure {...props} />, {
      context: {
        config: { minutesToDepartureLimit: 9 },
      },
    });
    expect(wrapper.find('span.destination').text()).to.equal(
      'Päiväranta-Keskusta-Pirtti',
    );
  });

  it('should show cancellation information', () => {
    const props = {
      canceled: true,
      currentTime: Date.now(),
      departure: {
        headsign: 'Kamppi via Töölö',
        pattern: {
          route: {
            mode: 'BUS',
          },
        },
        stoptime: 1547191795,
      },
    };
    const wrapper = shallowWithIntl(<Departure {...props} />);
    expect(wrapper.find('.departure-canceled')).to.have.lengthOf(1);
  });

  it('should use longName when the trip is missing', () => {
    const props = {
      className: 'departure padding-normal border-bottom',
      currentTime: 0,
      departure: {
        headsign: null,
        lastStop: false,
        pattern: {
          code: 'Lahti:311:1:01',
          headsign: null,
          route: {
            color: null,
            gtfsId: 'Lahti:311',
            id: 'Um91dGU6TGFodGk6MzEx',
            longName: 'PHKS - Matkakeskus - Kauppatori - Mäkelä',
            mode: 'BUS',
            shortName: '3S',
          },
        },
        pickupType: 'SCHEDULED',
        realtime: false,
        stop: {
          platformCode: null,
        },
        stoptime: 0,
      },
      isArrival: false,
      showPlatformCode: true,
      showStop: true,
      staticDeparture: true,
    };
    const wrapper = shallowWithIntl(<Departure {...props} />);
    expect(wrapper.find(RouteDestination).prop('destination')).to.equal(
      'PHKS - Matkakeskus - Kauppatori - Mäkelä',
    );
  });
});
