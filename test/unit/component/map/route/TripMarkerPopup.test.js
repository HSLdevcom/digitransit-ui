import React from 'react';

import { Component as TripMarkerPopup } from '../../../../../app/component/map/route/TripMarkerPopup';
import { shallowWithIntl } from '../../../helpers/mock-intl-enzyme';

describe('<TripMarkerPopup />', () => {
  it('should render popup', () => {
    const props = {
      addAsFavouriteRoute: () => {},
      favourite: false,
      id: 'OULU:12345',
      route: 'OULU:15',
      message: {
        direction: 0,
        geoHash: ['64;25', '95', '10', '18'],
        heading: undefined,
        headsign: undefined,
        id: 'OULU:12345',
        lat: 64.91143,
        long: 25.50852,
        mode: 'bus',
        next_stop: 'OULU:101590',
        operatingDay: '',
        route: 'OULU:15',
        shortName: '15',
        timestamp: 1573138253,
        tripId: 'OULU:12345',
        tripStartTime: undefined,
      },
      trip: {
        route: {
          gtfsId: 'OULU:15',
          longName: 'Koulutie - Kuvernööri',
          mode: 'BUS',
          shortName: '15',
        },
        trip: {
          pattern: {
            code: 'OULU:15:0:01',
            headsign: 'Keskusta (Kuvernööri)',
            stops: [
              {
                name: 'Koulutie',
              },
              {
                name: 'Kuvernööri',
              },
            ],
          },
          gtfsId: 'OULU:12345',
        },
      },
    };

    const wrapper = shallowWithIntl(<TripMarkerPopup {...props} />);
    expect(wrapper.find('.route')).to.have.lengthOf(1);
  });
});
