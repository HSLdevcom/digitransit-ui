import React from 'react';

import { Component as TripLink } from '../../../app/component/TripLink';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

describe('<TripLink />', () => {
  it('should render content and icon', () => {
    const props = {
      mode: 'bus',
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
    };

    const wrapper = shallowWithIntl(<TripLink {...props} />);
    expect(wrapper.find('.route-now-content')).to.have.lengthOf(1);
    expect(wrapper.find('.tail-icon')).to.have.lengthOf(1);
  });
});
