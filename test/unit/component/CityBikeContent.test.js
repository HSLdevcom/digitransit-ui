import React from 'react';

import CityBikeContent from '../../../app/component/CityBikeContent';
import CityBikeUse from '../../../app/component/CityBikeUse';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

const config = {
  cityBike: {
    networks: {
      samocat: {
        icon: 'scooter',
        name: {
          fi: 'Vuosaari',
        },
        type: 'scooter',
        url: {
          fi: 'https://www.osoite.fi/',
        },
      },
    },
  },
  transportModes: {
    citybike: {
      availableForSelection: true,
    },
  },
};
const props = {
  station: {
    name: 'Valimon asema',
    networks: ['Samocat'],
  },
  lang: 'fi',
};

describe('<CityBikeContent />', () => {
  it('should pass network type to sub components for type specific texts', () => {
    const wrapper = shallowWithIntl(<CityBikeContent {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find(CityBikeUse).props().type).to.equal('scooter');
  });

  it('should pass network specific url to sub components', () => {
    const wrapper = shallowWithIntl(<CityBikeContent {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find(CityBikeUse).props().url).to.equal(
      'https://www.osoite.fi/',
    );
  });
});
