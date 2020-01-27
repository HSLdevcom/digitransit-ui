import { expect } from 'chai';
import { createMemoryHistory } from 'history';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';

import QuickSettingsPanel from '../../../app/component/QuickSettingsPanel';
import defaultConfig from '../../../app/configurations/config.default';
import {
  StreetMode,
  OptimizeType,
  QuickOptionSetType,
} from '../../../app/constants';
import { setCustomizedSettings } from '../../../app/store/localStorage';
import { getAvailableStreetModes } from '../../../app/util/modeUtils';
import {
  getDefaultSettings,
  matchQuickOption,
} from '../../../app/util/planParamUtil';
import { createMemoryMockRouter } from '../helpers/mock-router';
import { fixArrayParams } from '../../../app/util/queryUtils';

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

  describe('matchQuickOption', () => {
    it('should return "default-route" by default', () => {
      const context = getDefaultContext(defaultConfig);

      const currentOption = matchQuickOption(context);
      expect(currentOption).to.equal(QuickOptionSetType.DefaultRoute);
    });

    it('should return "custom-settings" if no matching quick option set is found', () => {
      const context = getDefaultContext(defaultConfig);
      context.location.query.optimize = 'UNKNOWN';

      const currentOption = matchQuickOption(context);
      expect(currentOption).to.equal('custom-settings');
    });

    it('should return "saved-settings" if the current settings come from localStorage', () => {
      setCustomizedSettings({
        optimize: OptimizeType.Triangle,
        safetyFactor: 0.4,
        slopeFactor: 0.4,
        timeFactor: 0.2,
      });

      const context = getDefaultContext(defaultConfig);

      const currentOption = matchQuickOption(context);
      expect(currentOption).to.equal(QuickOptionSetType.SavedSettings);
    });

    it('should still return "saved-settings" if the current settings come from localStorage and they match another quick option set', () => {
      setCustomizedSettings({ ...getDefaultSettings(defaultConfig) });

      const context = getDefaultContext(defaultConfig);

      const currentOption = matchQuickOption(context);
      expect(currentOption).to.equal(QuickOptionSetType.SavedSettings);
    });

    it('should return the matching quick option set if the query and localStorage contain the same matching settings', () => {
      const settings = {
        ...getDefaultSettings(defaultConfig),
        modes: StreetMode.Bicycle,
        optimize: OptimizeType.Greenways,
      };
      setCustomizedSettings(settings);
      const router = { ...createMemoryMockRouter() };
      router.replace({ query: fixArrayParams(settings) });

      const context = {
        config: { ...defaultConfig },
        location: { ...router.getCurrentLocation() },
        router,
      };

      const currentOption = matchQuickOption(context);
      expect(currentOption).to.equal(QuickOptionSetType.PreferGreenways);
    });
  });

  describe('setQuickOption', () => {
    it('should remove all query params if the selected mode is "saved-settings"', () => {
      setCustomizedSettings({
        modes: StreetMode.Bicycle,
        optimize: OptimizeType.Greenways,
      });

      const router = { ...createMemoryMockRouter() };
      router.replace({
        query: { time: 123456789 },
      });

      const wrapper = shallowWithIntl(
        <QuickSettingsPanel {...getDefaultProps()} />,
        {
          context: {
            config: defaultConfig,
            location: {
              ...router.getCurrentLocation(),
            },
            router,
          },
        },
      );

      wrapper.instance().setQuickOption(QuickOptionSetType.SavedSettings);
      expect(router.getCurrentLocation().query).to.deep.equal({
        time: '123456789',
      });
    });
  });

  describe('togglePopUp', () => {
    it('should toggle the popup', () => {
      const wrapper = shallowWithIntl(
        <QuickSettingsPanel {...getDefaultProps()} />,
        {
          context: {
            ...getDefaultContext(defaultConfig),
          },
        },
      );

      wrapper.instance().togglePopUp();
      expect(wrapper.state('isPopUpOpen')).to.equal(true);

      wrapper.instance().togglePopUp();
      expect(wrapper.state('isPopUpOpen')).to.equal(false);
    });
  });
});
