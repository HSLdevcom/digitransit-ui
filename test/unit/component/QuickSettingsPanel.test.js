import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockChildContextTypes, mockContext } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

import QuickSettingsPanel from '../../../app/component/QuickSettingsPanel';
import DatetimepickerContainer from '../../../app/component/DatetimepickerContainer';
import defaultConfig from '../../../app/configurations/config.default';
import { mockMatch, mockRouter } from '../helpers/mock-router';

const getDefaultProps = () => ({
  timeSelectorStartTime: 1535447686000,
  timeSelectorEndTime: 1535451326000,
  timeSelectorServiceTimeRange: {
    start: 1534798800,
    end: 1538081999,
  },
  toggleSettings: () => {},
});

describe('<QuickSettingsPanel />', () => {
  it('should render time picker', () => {
    const props = getDefaultProps();
    const wrapper = mountWithIntl(<QuickSettingsPanel {...props} />, {
      context: {
        router: mockRouter,
        match: mockMatch,
        config: defaultConfig,
        getStore: mockContext.getStore,
      },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find(DatetimepickerContainer)).to.have.lengthOf(1);
    wrapper.unmount();
  });
});
