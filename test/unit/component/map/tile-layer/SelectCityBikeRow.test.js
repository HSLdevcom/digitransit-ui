import React from 'react';

import SelectCityBikeRow from '../../../../../app/component/map/tile-layer/SelectCityBikeRow';
import { shallowWithIntl } from '../../../helpers/mock-intl-enzyme';
import Icon from '../../../../../app/component/Icon';

describe('<SelectCityBikeRow />', () => {
  it('should use the citybike icon by default', () => {
    const props = {
      name: 'foobar',
      network: 'some_network',
      id: '001',
    };
    const wrapper = shallowWithIntl(<SelectCityBikeRow {...props} />);
    expect(wrapper.find(Icon).first().prop('img')).to.contain('citybike');
  });

  it('should use the configured icon for the network', () => {
    const props = {
      name: 'foobar',
      network: 'scooter_network',
      id: '001',
    };
    const wrapper = shallowWithIntl(<SelectCityBikeRow {...props} />, {
      context: {
        config: {
          cityBike: { networks: { scooter_network: { icon: 'scooter' } } },
        },
      },
    });
    expect(wrapper.find(Icon).first().prop('img')).to.contain('scooter');
  });
});
