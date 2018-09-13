import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import CustomizeSearch from '../../../app/component/CustomizeSearchNew';
import PreferredRoutes from '../../../app/component/PreferredRoutes';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import defaultConfig from '../../../app/configurations/config.default';

describe('<CustomizeSearch />', () => {
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
});
