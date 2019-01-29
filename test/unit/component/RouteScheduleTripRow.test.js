import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import RouteScheduleTripRow from '../../../app/component/RouteScheduleTripRow';

describe('<RouteScheduleTripRow />', () => {
  it('should highlight a canceled departure', () => {
    const props = {
      isCanceled: true,
      departureTime: '10.50',
      arrivalTime: '11.55',
    };
    const wrapper = shallowWithIntl(<RouteScheduleTripRow {...props} />);
    expect(wrapper.find('.trip-from.canceled')).to.have.lengthOf(1);
    expect(wrapper.find('.trip-to.canceled')).to.have.lengthOf(1);
  });
});
