import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import moment from 'moment';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as LangSelect } from '../../../app/component/LangSelect';

describe('LangSelect', () => {
  after(() => {
    moment.locale('en');
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
});
