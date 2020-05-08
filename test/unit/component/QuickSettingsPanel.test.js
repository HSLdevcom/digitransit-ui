import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';

import QuickSettingsPanel from '../../../app/component/QuickSettingsPanel';
import Datetimepicker from '../../../app/component/Datetimepicker';
import RightOffcanvasToggle from '../../../app/component/RightOffcanvasToggle';
import defaultConfig from '../../../app/configurations/config.default';
import { mockMatch, mockRouter } from '../helpers/mock-router';

const getDefaultProps = () => ({
  timeSelectorStartTime: 1535447686000,
  timeSelectorEndTime: 1535451326000,
  timeSelectorServiceTimeRange: {
    start: 1534798800,
    end: 1538081999,
  },
});

describe('<QuickSettingsPanel />', () => {
  it('should render time picker and advanced settings toggle', () => {
    const props = getDefaultProps();
    const wrapper = mountWithIntl(<QuickSettingsPanel {...props} />, {
      context: {
        router: mockRouter,
        match: mockMatch,
        config: defaultConfig,
      },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find(Datetimepicker)).to.have.lengthOf(1);
    expect(wrapper.find(RightOffcanvasToggle)).to.have.lengthOf(1);
  });
});
