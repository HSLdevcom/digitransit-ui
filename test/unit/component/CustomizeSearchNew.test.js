/* import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import { after, before, describe, it } from 'mocha';
import React from 'react';

import CustomizeSearch from '../../../app/component/CustomizeSearchNew';
import CityBikeNetworkSelector from '../../../app/component/CityBikeNetworkSelector';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import defaultConfig from '../../../app/configurations/config.default';
import hslConfig from '../../../app/configurations/config.hsl';

const mergedConfig = {
  ...defaultConfig,
  ...hslConfig,
};

describe('<CustomizeSearch />', () => {
  before(() => {
    fetchMock.post('/graphql', {
      data: {
        route: {
          id: 'Um91dGU6SFNMOjI1NTA=',
          shortName: '550',
          longName: 'Itäkeskus-Westendinasema',
          mode: 'BUS',
        },
      },
    });
  });

  after(() => {
    fetchMock.restore();
  });

  it.skip('should show citybike network selector when many networks are available', () => {
    const wrapper = mountWithIntl(
      <CustomizeSearch onToggleClick={() => {}} />,
      {
        context: {
          ...mockContext,
          config: {
            ...mergedConfig,
            transportModes: {
              ...mergedConfig.transportModes,
              citybike: {
                availableForSelection: true,
              },
            },
          },
          location: {
            ...mockContext.location,
          },
          router: createMemoryMockRouter(),
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    expect(wrapper.find(CityBikeNetworkSelector)).to.have.lengthOf(1);
  });

  it.skip('should hide citybike network selector when citybike routing is disabled', () => {
    const wrapper = mountWithIntl(
      <CustomizeSearch onToggleClick={() => {}} />,
      {
        context: {
          ...mockContext,
          config: {
            ...mergedConfig,
            transportModes: {
              ...mergedConfig.transportModes,
              citybike: {
                availableForSelection: false,
              },
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    expect(wrapper.find(CityBikeNetworkSelector)).to.have.lengthOf(0);
  });
});
*/
