import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { LeafletProvider } from 'react-leaflet/es/context';

import { mockContext, mockChildContextTypes } from '../../helpers/mock-context';
import { mountWithIntl } from '../../helpers/mock-intl-enzyme';
import { mockMatch, mockRouter } from '../../helpers/mock-router';

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

      let callParams;
      const router = {
        ...mockRouter,
        replace: params => {
          callParams = params;
        },
      };
      const match = {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          state: {
            summaryPageSelected: 1,
          },
        },
      };

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
            match,
            router,
          },
          childContextTypes: mockChildContextTypes,
        },
      );

      instance.routeFrom();

      const { state } = callParams;
      expect(state.summaryPageSelected).to.equal(0);
    });
  });

  describe('routeTo', () => {
    it('should reset the summaryPageSelected state', () => {
      const props = {
        location: {},
      };

      let callParams;
      const router = {
        ...mockRouter,
        replace: params => {
          callParams = params;
        },
      };
      const match = {
        ...mockMatch,
        location: {
          ...mockMatch.location,
          state: {
            summaryPageSelected: 1,
          },
        },
      };

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
            match,
            router,
          },
          childContextTypes: mockChildContextTypes,
        },
      );

      instance.routeTo();

      const { state } = callParams;
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

    const match = {
      ...mockMatch,
      location: {
        ...mockMatch.location,
        state: {
          summaryPageSelected: 1,
        },
        pathname: `/${PREFIX_ITINERARY_SUMMARY}/`,
        query: {
          intermediatePlaces: [
            'Nordenskiöldinkatu 5, Helsinki::60.18754243199426,24.918216001392587',
            'Minna Canthin katu 24, Helsinki::60.18788144268873,24.91545734471498',
          ],
        },
      },
    };

    const wrapper = mountWithIntl(
      <MarkerPopupBottomWithoutLeaflet {...props} />,
      {
        context: {
          ...mockContext,
          match,
          router: mockRouter,
        },
        childContextTypes: mockChildContextTypes,
      },
    );

    expect(wrapper.find('.route-add-viapoint').length).to.equal(1);
  });
});
