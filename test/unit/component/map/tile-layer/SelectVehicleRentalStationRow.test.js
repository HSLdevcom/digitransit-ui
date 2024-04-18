import React from 'react';

import SelectVehicleRentalStationRow from '../../../../../app/component/map/tile-layer/SelectVehicleRentalStationRow';
import { shallowWithIntl } from '../../../helpers/mock-intl-enzyme';
import Icon from '../../../../../app/component/Icon';

describe('<SelectVehicleRentalStationRow />', () => {
  it('should use the citybike icon by default', () => {
    const props = {
      name: 'foobar',
      network: 'some_network',
      id: '001',
      prefix: 'citybike',
    };
    const wrapper = shallowWithIntl(
      <SelectVehicleRentalStationRow {...props} />,
    );
    expect(wrapper.find(Icon).first().prop('img')).to.contain('citybike');
  });

  it('should use the configured icon for the network', () => {
    const props = {
      name: 'foobar',
      network: 'scooter_network',
      id: '001',
      prefix: 'citybike',
    };
    const wrapper = shallowWithIntl(
      <SelectVehicleRentalStationRow {...props} />,
      {
        context: {
          config: {
            cityBike: { networks: { scooter_network: { icon: 'scooter' } } },
          },
        },
      },
    );
    expect(wrapper.find(Icon).first().prop('img')).to.contain('scooter');
  });
});
