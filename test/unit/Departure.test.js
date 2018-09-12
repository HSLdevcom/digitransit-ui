import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mountWithIntl } from './helpers/mock-intl-enzyme';
import Departure from '../../app/component/Departure';

import data from './test-data/dt2734';

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
    expect(wrapper.find('span.destination').text()).to.not.equal('Keskusta');
    expect(wrapper.find('span.destination').text()).to.not.equal(
      'Päiväranta-Keskusta',
    );
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
    expect(wrapper.find('span.destination').text()).to.not.equal('Pirttiniemi');
    expect(wrapper.find('span.destination').text()).to.not.equal(
      'Päiväranta-Keskusta',
    );
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
    expect(wrapper.find('span.destination').text()).to.not.equal('Keskusta');
    expect(wrapper.find('span.destination').text()).to.not.equal('Pirttiniemi');
  });
});
