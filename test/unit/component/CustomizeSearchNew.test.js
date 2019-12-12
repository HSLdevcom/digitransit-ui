import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import { after, before, describe, it } from 'mocha';
import React from 'react';

import CustomizeSearch from '../../../app/component/CustomizeSearchNew';
import PreferredRoutes from '../../../app/component/PreferredRoutes';
import CityBikeNetworkSelector from '../../../app/component/CityBikeNetworkSelector';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { createMemoryMockRouter } from '../helpers/mock-router';
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

  it('should read preferred routes from the url', () => {
    const wrapper = mountWithIntl(
      <CustomizeSearch onToggleClick={() => {}} />,
      {
        context: {
          ...mockContext,
          config: { ...defaultConfig },
          location: {
            ...mockContext.location,
            query: { preferredRoutes: 'HSL__2550' },
          },
          router: createMemoryMockRouter(),
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    const component = wrapper.find(PreferredRoutes);
    const routesContainer = component.find(
      '.preferred-routes-container .preferred-routes-list',
    );
    expect(routesContainer.find('.route-name')).to.have.lengthOf(1);
  });

  it('should read unpreferred routes from the url', () => {
    const wrapper = mountWithIntl(
      <CustomizeSearch onToggleClick={() => {}} />,
      {
        context: {
          ...mockContext,
          config: { ...defaultConfig },
          location: {
            ...mockContext.location,
            query: { unpreferredRoutes: 'HSL__2550' },
          },
          router: createMemoryMockRouter(),
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    const component = wrapper.find(PreferredRoutes);
    const routesContainer = component.find(
      '.avoid-routes-container .preferred-routes-list',
    );
    expect(routesContainer.find('.route-name')).to.have.lengthOf(1);
  });

  it('should show citybike network selector when many networks are available', () => {
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

  it('should hide citybike network selector when citybike routing is disabled', () => {
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
    expect(wrapper.find(CityBikeNetworkSelector)).to.have.lengthOf(0);
  });
});
