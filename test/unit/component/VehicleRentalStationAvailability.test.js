import React from 'react';

import { mockChildContextTypes } from '../helpers/mock-context';
import VehiclesRentalStationAvailability from '../../../app/component/VehiclesRentalStationAvailability';
import Availability from '../../../app/component/Availability';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

describe('<VehicleRentalStationAvailability />', () => {
  it('should render CityBikeAvailability with valid props', () => {
    const props = {
      vehiclesAvailable: 1,
      totalSpaces: 3,
      fewAvailableCount: 3,
      fewerAvailableCount: 2,
      type: 'citybike',
      useSpacesAvailable: true,
    };
    const wrapper = mountWithIntl(
      <VehiclesRentalStationAvailability {...props} />,
      {
        context: {
          config: {
            cityBike: { useSpacesAvailable: true },
          },
        },
        childContextTypes: { ...mockChildContextTypes },
      },
    );
    expect(wrapper.find(Availability)).to.have.lengthOf(1);
    expect(wrapper.find('.availability-header')).to.have.lengthOf(1);
  });
});
