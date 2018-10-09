import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from '../../helpers/mock-context';
import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
import { createMemoryMockRouter } from '../../helpers/mock-router';

import MarkerPopupBottom from '../../../../app/component/map/MarkerPopupBottom';

describe('<MarkerPopupBottom />', () => {
  describe('routeFrom', () => {
    it('should reset the summaryPageSelected state', () => {
      const props = {
        location: {},
      };

      const router = createMemoryMockRouter();
      router.replace({
        state: {
          summaryPageSelected: 1,
        },
      });

      const wrapper = mountWithIntl(<MarkerPopupBottom {...props} />, {
        context: {
          ...mockContext,
          location: router.getCurrentLocation(),
          map: { closePopup: () => {} },
          router,
        },
        childContextTypes: mockChildContextTypes,
      });

      wrapper.instance().routeFrom();

      const { state } = router.getCurrentLocation();
      expect(state.summaryPageSelected).to.equal(0);
    });
  });

  describe('routeTo', () => {
    it('should reset the summaryPageSelected state', () => {
      const props = {
        location: {},
      };

      const router = createMemoryMockRouter();
      router.replace({
        state: {
          summaryPageSelected: 1,
        },
      });

      const wrapper = mountWithIntl(<MarkerPopupBottom {...props} />, {
        context: {
          ...mockContext,
          location: router.getCurrentLocation(),
          map: { closePopup: () => {} },
          router,
        },
        childContextTypes: mockChildContextTypes,
      });

      wrapper.instance().routeTo();

      const { state } = router.getCurrentLocation();
      expect(state.summaryPageSelected).to.equal(0);
    });
  });
});
