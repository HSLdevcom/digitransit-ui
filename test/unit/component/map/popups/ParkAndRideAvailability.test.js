import React from 'react';

import { mockChildContextTypes } from '../../../helpers/mock-context';
import ParkAndRideAvailability from '../../../../../app/component/map/popups/ParkAndRideAvailability';
import Availability from '../../../../../app/component/Availability';
import { mountWithIntl } from '../../../helpers/mock-intl-enzyme';

describe('<ParkAndRideAvailability />', () => {
  it('should render ParkAndRideAvailability with valid props', () => {
    const props = {
      spacesAvailable: 1,
      maxCapacity: 3,
      realtime: true,
    };
    const wrapper = mountWithIntl(<ParkAndRideAvailability {...props} />, {
      context: {
        config: {
          cityBike: { useSpacesAvailable: true },
        },
      },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(Availability)).to.have.lengthOf(1);
    expect(wrapper.find('.availability-header')).to.have.lengthOf(1);
  });
});
