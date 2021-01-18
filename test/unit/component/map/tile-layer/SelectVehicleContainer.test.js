import React from 'react';
import { ReactRelayContext } from 'react-relay';

import { mountWithIntl } from '../../../helpers/mock-intl-enzyme';
import SelectVehicleContainer from '../../../../../app/component/map/tile-layer/SelectVehicleContainer';

describe('<SelectVehicleContainer />', () => {
  it('should render', () => {
    const props = {
      vehicle: {
        direction: 1,
        heading: 36,
        headsign: undefined,
        id: 'HSL_01317',
        lat: 60.17874,
        long: 24.82601,
        mode: 'bus',
        next_stop: 'HSL:2222234',
        operatingDay: '2021-01-18',
        route: 'HSL:2550',
        shortName: '550',
        timestamp: 1610977447,
        tripStartTime: '1530',
      },
      rowView: false,
    };
    const environment = {};
    const wrapper = mountWithIntl(
      <ReactRelayContext.Provider value={{ environment }}>
        <SelectVehicleContainer {...props} />
      </ReactRelayContext.Provider>,
    );
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
