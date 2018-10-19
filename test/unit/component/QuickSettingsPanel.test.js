import { expect } from 'chai';
import { createMemoryHistory } from 'history';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

import QuickSettingsPanel from '../../../app/component/QuickSettingsPanel';
import defaultConfig from '../../../app/configurations/config.default';
import { StreetMode } from '../../../app/constants';
import { getAvailableStreetModes } from '../../../app/util/modeUtils';

const getDefaultProps = () => ({
  timeSelectorStartTime: 1535447686000,
  timeSelectorEndTime: 1535451326000,
  timeSelectorServiceTimeRange: {
    start: 1534798800,
    end: 1538081999,
  },
});

const getDefaultContext = (config, modes = undefined) => {
  const router = {
    ...createMemoryHistory(),
    isActive: () => {},
    setRouteLeaveHook: () => {},
  };
  return {
    ...mockContext,
    config,
    location: {
      ...router.getCurrentLocation(),
      query: {
        modes,
      },
    },
    router,
  };
};

describe('<QuickSettingsPanel />', () => {
  it('should render quick options based on availableOptionSets', () => {
    const props = getDefaultProps();
    const config = {
      ...defaultConfig,
      quickOptions: {
        walk: {
          availableOptionSets: ['least-transfers', 'least-walking'],
        },
      },
    };
    const wrapper = mountWithIntl(<QuickSettingsPanel {...props} />, {
      context: getDefaultContext(config, StreetMode.Walk),
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find('.select-route-modes > option')).to.have.lengthOf(3);
    expect(
      wrapper.find('.select-route-modes > option[value="least-transfers"]'),
    ).to.have.lengthOf(1);
    expect(
      wrapper.find('.select-route-modes > option[value="least-walking"]'),
    ).to.have.lengthOf(1);
  });

  it('should have the default route option always available', () => {
    const props = getDefaultProps();
    const context = getDefaultContext(defaultConfig);
    const wrapper = mountWithIntl(<QuickSettingsPanel {...props} />, {
      context,
      childContextTypes: { ...mockChildContextTypes },
    });

    const modes = getAvailableStreetModes(defaultConfig);
    expect(modes.length).to.be.greaterThan(0);
    modes.forEach(mode => {
      context.location.query.modes = mode;
      wrapper.setContext(context);
      expect(
        wrapper.find('.select-route-modes > option[value="default-route"]'),
      ).to.have.lengthOf(1);
    });
  });

  it('should have the "least elevation changes" routing option available for biking', () => {
    const props = getDefaultProps();
    const context = getDefaultContext(defaultConfig);
    context.location.query.modes = 'BICYCLE';

    const wrapper = mountWithIntl(<QuickSettingsPanel {...props} />, {
      context,
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(
      wrapper.find(
        '.select-route-modes > option[value="least-elevation-changes"]',
      ),
    ).to.have.lengthOf(1);
  });
});
