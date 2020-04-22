import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { LeafletProvider } from 'react-leaflet/es/context';

import { mockContext, mockChildContextTypes } from '../../helpers/mock-context';
import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
import { createMemoryMockRouter } from '../../helpers/mock-router';

import MarkerPopupBottom, {
  Component as MarkerPopupBottomWithoutLeaflet,
} from '../../../../app/component/map/MarkerPopupBottom';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../app/util/path';

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
  it('should render a viapoint button when in route view', () => {
    const props = {
      location: {},
      leaflet: {
        map: {
          closePopup: () => {},
        },
      },
    };

    const router = createMemoryMockRouter();
    router.replace({
      state: {
        summaryPageSelected: 1,
      },
    });

    const wrapper = mountWithIntl(
      <MarkerPopupBottomWithoutLeaflet {...props} />,
      {
        context: {
          ...mockContext,
          location: {
            ...router.getCurrentLocation(),
            pathname: `/${PREFIX_ITINERARY_SUMMARY}/`,
            query: {
              intermediatePlaces: [
                'Nordenskiöldinkatu 5, Helsinki::60.18754243199426,24.918216001392587',
                'Minna Canthin katu 24, Helsinki::60.18788144268873,24.91545734471498',
              ],
            },
          },
          router,
        },
        childContextTypes: mockChildContextTypes,
      },
    );

    expect(wrapper.find('.route-add-viapoint').length).to.equal(1);
  });
});
