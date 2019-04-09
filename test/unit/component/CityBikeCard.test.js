import React from 'react';

import CardHeader from '../../../app/component/CardHeader';
import CityBikeCard from '../../../app/component/CityBikeCard';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

describe('<CityBikeCard />', () => {
  it("should have the citybike network's icon", () => {
    const props = {
      children: <div />,
      station: {
        name: 'Valimon asema',
        networks: ['Samocat'],
      },
    };
    const wrapper = shallowWithIntl(<CityBikeCard {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: {
              samocat: { icon: 'scooter' },
            },
          },
        },
      },
    });
    expect(wrapper.find(CardHeader).props().icon).to.equal('icon-icon_scooter');
  });

  it("should include the citybike network's name in the description", () => {
    const props = {
      children: <div />,
      station: {
        name: 'Valimon asema',
        networks: ['Samocat'],
      },
    };
    const wrapper = shallowWithIntl(<CityBikeCard {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: {
              samocat: {
                name: {
                  en: 'Foobar',
                },
              },
            },
          },
        },
      },
    });
    expect(wrapper.find(CardHeader).props().description).to.contain('Foobar');
  });

  it("should include the citybike station's id in the description", () => {
    const props = {
      children: <div />,
      station: {
        name: 'Valimon asema',
        stationId: '1234',
      },
    };
    const wrapper = shallowWithIntl(<CityBikeCard {...props} />, {
      context: { config: { cityBike: { showStationId: true } } },
    });
    expect(wrapper.find(CardHeader).props().description).to.contain('1234');
  });
});
