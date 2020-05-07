import React from 'react';

import { mockChildContextTypes } from '../helpers/mock-context';
import CityBikeAvailability from '../../../app/component/CityBikeAvailability';
import Availability from '../../../app/component/Availability';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

describe('<CityBikeAvailability />', () => {
  it('should render CityBikeAvailability with valid props', () => {
    const props = {
      bikesAvailable: 1,
      totalSpaces: 3,
      fewAvailableCount: 3,
      type: 'citybike',
      useSpacesAvailable: true,
    };
    const wrapper = mountWithIntl(<CityBikeAvailability {...props} />, {
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
