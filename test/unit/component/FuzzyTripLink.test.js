import React from 'react';

import FuzzyTripLink from '../../../app/component/FuzzyTripLink';
import IconWithTail from '../../../app/component/IconWithTail';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

describe('<FuzzyTripLink />', () => {
  it('should render content and icon', () => {
    const props = {
      trip: {
        trip: {
          route: {
            gtfsId: 'OULU:15',
          },
          pattern: {
            code: '1',
          },
          gtfsId: 'OULU:12345',
        },
      },
      vehicle: {
        direction: 0,
        mode: 'bus',
        operatingDay: '2020-05-09',
        route: 'HSL:2550',
        tripStartTime: '2143',
      },
    };

    const wrapper = mountWithIntl(<FuzzyTripLink {...props} />);
    expect(wrapper.find('.route-now-content')).to.have.lengthOf(1);
    expect(wrapper.find(IconWithTail)).to.have.lengthOf(1);
  });
});
