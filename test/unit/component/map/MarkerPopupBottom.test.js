import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { LeafletProvider } from 'react-leaflet/es/context';

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

      let instance;
      mountWithIntl(
        <LeafletProvider value={{ map: { closePopup: () => {} } }}>
          <MarkerPopupBottom
            {...props}
            ref={el => {
              instance = el;
            }}
          />
        </LeafletProvider>,
        {
          context: {
            ...mockContext,
            location: router.getCurrentLocation(),
            router,
          },
          childContextTypes: mockChildContextTypes,
        },
      );

      instance.routeFrom();

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

      let instance;
      mountWithIntl(
        <LeafletProvider value={{ map: { closePopup: () => {} } }}>
          <MarkerPopupBottom
            {...props}
            ref={el => {
              instance = el;
            }}
          />
        </LeafletProvider>,
        {
          context: {
            ...mockContext,
            location: router.getCurrentLocation(),
            router,
          },
          childContextTypes: mockChildContextTypes,
        },
      );

      instance.routeTo();

      const { state } = router.getCurrentLocation();
      expect(state.summaryPageSelected).to.equal(0);
    });
  });
});
