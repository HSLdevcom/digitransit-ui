import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import {
  getRelayContextMock,
  mockRelayChildContextTypes,
} from './helpers/mock-relay';

import dt2772b from './test-data/dt2772b';
import PrintableItineraryHeader from '../../app/component/PrintableItineraryHeader';

describe('<PrintableItineraryHeader />', () => {
  it('should render as many fares as present in the itinerary', () => {
    const props = {
      itinerary: { ...dt2772b },
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        ...mockContext,
        ...getRelayContextMock(),
        config: { showTicketInformation: true },
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
});
