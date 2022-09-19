import React from 'react';

import { ReactRelayContext } from 'react-relay';

import TripLink from '../../../app/component/TripLink';
import VehicleIcon from '../../../app/component/VehicleIcon';
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
        route: 'feed:1',
        direction: 0,
        tripStartTime: '0600',
        operatingDay: '0',
        next_stop: '2',
        timestamp: 0,
      },
    };
    const environment = {};

    const wrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <TripLink {...props} />
      </ReactRelayContext.Provider>,
    );
    expect(wrapper.find('.route-now-content')).to.have.lengthOf(1);
    expect(wrapper.find(VehicleIcon)).to.have.lengthOf(1);
  });
});
