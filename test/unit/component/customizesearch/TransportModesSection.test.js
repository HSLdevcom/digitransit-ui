import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { createMemoryHistory } from 'react-router';

import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../../helpers/mock-context';

import TransportModesSection from '../../../../app/component/customizesearch/TransportModesSection';

describe('<TransportModesSection />', () => {
  it('should change the selected transport modes upon clicking a checkbox', () => {
    const router = {
      ...createMemoryHistory(),
      isActive: () => {},
      setRouteLeaveHook: () => {},
    };
    router.replace({ query: { modes: 'BUS' } });

    const props = {
      config: {
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
      currentModes: router.getCurrentLocation().query.modes.split(','),
    };
    const wrapper = mountWithIntl(<TransportModesSection {...props} />, {
      context: { ...mockContext, router },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(
      wrapper
        .find('.option-checkbox input')
        .at(0)
        .prop('checked'),
    ).to.equal(true);
    expect(
      wrapper
        .find('.option-checkbox input')
        .at(1)
        .prop('checked'),
    ).to.equal(false);

    wrapper
      .find('.option-checkbox input')
      .at(1)
      .simulate('change', { target: { checked: true } });
    expect(router.getCurrentLocation().query.modes).to.equal('BUS,RAIL');
  });
});
