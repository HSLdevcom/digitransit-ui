import React from 'react';

import { ReactRelayContext } from 'react-relay';

import TripLink from '../../../app/component/TripLink';
import IconWithTail from '../../../app/component/IconWithTail';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

describe('<TripLink />', () => {
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
        mode: 'bus',
        id: 'OULU:1074',
        tripId: 'OULU:0000075602101021',
        shortName: '74',
      },
    };
    const environment = {};

    const wrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <TripLink {...props} />
      </ReactRelayContext.Provider>,
    );
    expect(wrapper.find('.route-now-content')).to.have.lengthOf(1);
    expect(wrapper.find(IconWithTail)).to.have.lengthOf(1);
  });
});
