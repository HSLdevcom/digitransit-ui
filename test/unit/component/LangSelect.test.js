import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import moment from 'moment';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import configureMoment from '../../../app/util/configure-moment';
import {
  Component as LangSelect,
  selectLanguage,
} from '../../../app/component/LangSelect';

describe('LangSelect', () => {
  after(() => {
    moment.locale('en');
    moment.tz.setDefault();
  });

  describe('<LangSelect />', () => {
    it('should render', () => {
      const wrapper = shallowWithIntl(<LangSelect currentLanguage="en" />, {
        context: {
          ...mockContext,
          executeAction: () => true,
          config: { availableLanguages: ['fi', 'sv', 'en'] },
        },
      });
      expect(wrapper.isEmptyRender()).to.equal(false);
    });
  });

  describe('selectLanguage', () => {
    it('should change moment locale', () => {
      const configWithMoment = {
        moment: {
          relativeTimeThreshold: {
            seconds: 55,
            minutes: 59,
            hours: 23,
            days: 26,
            months: 11,
          },
        },
        timezoneData:
          'Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 ' +
          'WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',
      };

      const mockRouter = {
        getCurrentLocation: () => '/',
        replace: () => true,
      };

      configureMoment('sv', configWithMoment);
      expect(moment.locale()).to.equal('sv');
      selectLanguage(() => true, 'fi', mockRouter)();
      expect(moment.locale()).to.equal('fi');
    });
  });
});
