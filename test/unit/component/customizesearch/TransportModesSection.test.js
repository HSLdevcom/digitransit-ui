import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockMatch } from '../../helpers/mock-router';
import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../../helpers/mock-context';

import { getModes } from '../../../../app/util/modeUtils';
import TransportModesSection from '../../../../app/component/customizesearch/TransportModesSection';
import Toggle from '../../../../app/component/Toggle';

describe('<TransportModesSection />', () => {
  it('should change the selected transport modes upon clicking a checkbox', () => {
    const match = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: {},
      },
    };

    const props = {
      config: {
        walkBoardCostHigh: 100,
        transportModes: {
          bus: {
            availableForSelection: true,
            defaultValue: true,
          },
          rail: {
            availableForSelection: true,
            defaultValue: true,
          },
        },
        cityBike: { networks: {} },
      },
      currentSettings: { modes: ['BUS'] },
      defaultSettings: { walkBoardCost: 50 },
    };
    const wrapper = mountWithIntl(<TransportModesSection {...props} />, {
      context: { ...mockContext, match },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find(Toggle).at(0).prop('toggled')).to.equal(true);
    expect(wrapper.find(Toggle).at(1).prop('toggled')).to.equal(false);

    wrapper.find(Toggle).at(1).props().onToggle();
    expect(getModes(props.config)).to.deep.equal(['BUS', 'RAIL']);
  });
});
