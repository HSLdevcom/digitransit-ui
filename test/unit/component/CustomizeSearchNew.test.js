import { expect } from 'chai';
import { describe, it } from 'mocha';
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
        },
        childContextTypes: {
          ...mockChildContextTypes,
        },
      },
    );
    expect(wrapper.find(CityBikeNetworkSelector)).to.have.lengthOf(0);
  });
});
