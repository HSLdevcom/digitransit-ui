import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import Toggle from 'material-ui/Toggle';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../../helpers/mock-context';

import TransportModesSection from '../../../../app/component/customizesearch/TransportModesSection';

describe('<TransportModesSection />', () => {
  it('should change the selected transport modes upon clicking a checkbox', () => {
    let callParams;
    const router = {
      ...mockRouter,
      replace: params => {
        callParams = params;
      },
    };
    const match = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        query: { modes: 'BUS' },
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
      },
      currentSettings: { modes: ['BUS'] },
      defaultSettings: { walkBoardCost: 50 },
    };
    const wrapper = mountWithIntl(<TransportModesSection {...props} />, {
      context: { ...mockContext, router, match },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(
      wrapper
        .find(Toggle)
        .at(0)
        .prop('toggled'),
    ).to.equal(true);
    expect(
      wrapper
        .find(Toggle)
        .at(1)
        .prop('toggled'),
    ).to.equal(false);

    wrapper
      .find(Toggle)
      .at(1)
      .props()
      .onToggle();
    expect(callParams.query).to.deep.equal({ modes: 'BUS,RAIL' });
  });
});
