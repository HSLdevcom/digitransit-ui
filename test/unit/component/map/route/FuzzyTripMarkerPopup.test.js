import React from 'react';

import { Component as FuzzyTripMarkerPopup } from '../../../../../app/component/map/route/FuzzyTripMarkerPopup';
import { shallowWithIntl } from '../../../helpers/mock-intl-enzyme';

describe('<FuzzyTripMarkerPopup />', () => {
  it('should render popup', () => {
    const props = {
      addAsFavouriteRoute: () => {},
      date: '2019-11-07',
      time: 60840,
      favourite: false,
      direction: 0,
      route: 'HSL:1015',
      message: {
        direction: 0,
        heading: 319,
        headsign: undefined,
        id: 'HSL_01260',
        lat: 60.19518,
        long: 24.97514,
        mode: 'bus',
        next_stop: 'HSL:1210111',
        operatingDay: '2019-11-07',
        route: 'HSL:1015',
        timestamp: 1573139525,
        tripStartTime: '1654',
      },
      trip: {
        route: {
          gtfsId: 'HSL:1015',
          longName: 'Rautatientori-Koskela',
          mode: 'BUS',
          shortName: '15',
        },
        fuzzyTrip: {
          pattern: {
            code: 'HSL:1015:0:01',
            headsign: 'Koskela',
            stops: [
              {
                name: 'Rautatientori',
              },
              {
                name: 'Koskela',
              },
            ],
          },
          gtfsId: 'HSL:1015_20191106_To_1_1654',
        },
      },
    };

    const wrapper = shallowWithIntl(<FuzzyTripMarkerPopup {...props} />);
    expect(wrapper.find('.route')).to.have.lengthOf(1);
  });
});
