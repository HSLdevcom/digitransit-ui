import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mountWithIntl } from './helpers/mock-intl-enzyme';
import Departure from '../../app/component/Departure';

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
});
