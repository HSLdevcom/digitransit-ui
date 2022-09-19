import React from 'react';

import { ReactRelayContext } from 'react-relay';

import FuzzyTripLink from '../../../app/component/FuzzyTripLink';
import VehicleIcon from '../../../app/component/VehicleIcon';
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
        shortName: '550',
      },
      stopName: '1',
      nextStopName: '2',
    };
    const environment = {};

    const wrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <FuzzyTripLink {...props} />
      </ReactRelayContext.Provider>,
    );
    expect(wrapper.find('.route-now-content')).to.have.lengthOf(1);
    expect(wrapper.find(VehicleIcon)).to.have.lengthOf(1);
  });
});
