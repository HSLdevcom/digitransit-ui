import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import {
  getRelayContextMock,
  mockRelayChildContextTypes,
} from './helpers/mock-relay';

import dt2772a from './test-data/dt2772a';
import dt2772b from './test-data/dt2772b';

import PrintableItineraryHeader from '../../app/component/PrintableItineraryHeader';

describe('<PrintableItineraryHeader />', () => {
  const config = {
    showTicketInformation: true,
    fareMapping: t => t,
  };

  it('should render as many fares as present in the itinerary', () => {
    const props = {
      itinerary: { ...dt2772b },
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config,
      },
      childContextTypes: {
        ...mockChildContextTypes,
        ...mockRelayChildContextTypes,
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(
      props.itinerary.fares[0].components.length,
    );
  });

  it('should not render any tickets if total cost is unknown', () => {
    const props = {
      itinerary: { ...dt2772a },
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config,
      },
      childContextTypes: {
        ...mockChildContextTypes,
        ...mockRelayChildContextTypes,
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(0);
  });
});
