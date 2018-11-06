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

import { Component as PrintableItineraryHeader } from '../../app/component/PrintableItineraryHeader';
import ZoneTicketIcon from '../../app/component/ZoneTicketIcon';

describe('<PrintableItineraryHeader />', () => {
  const config = {
    showTicketInformation: true,
    fareMapping: fareId => fareId.replace('HSL:', ''),
  };

  it('should render as many fares as present in the itinerary', () => {
    const props = {
      itinerary: { ...dt2772b },
      language: 'en',
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(
      props.itinerary.fares[0].components.length,
    );
  });

  it('should not render any tickets if total cost is unknown', () => {
    const props = {
      itinerary: { ...dt2772a },
      language: 'en',
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(0);
  });

  it('should use ticket icons if configured', () => {
    const props = {
      itinerary: {
        fares: [
          {
            cents: 800,
            currency: 'EUR',
            components: [
              {
                fareId: 'HSL:ABCD',
              },
            ],
            type: 'regular',
          },
        ],
        legs: [
          {
            from: {},
            to: {},
          },
        ],
      },
      language: 'en',
    };
    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config: {
          ...config,
          useTicketIcons: true,
        },
      },
    });

    expect(wrapper.find(ZoneTicketIcon)).to.have.lengthOf(1);
    expect(wrapper.find(ZoneTicketIcon).props().ticketType).to.equal('ABCD');
  });

  it('should show AB and BC tickets for a trip within B zone', () => {
    const props = {
      itinerary: {
        fares: [
          {
            cents: 280,
            currency: 'EUR',
            components: [
              {
                fareId: 'HSL:AB',
              },
            ],
            type: 'regular',
          },
        ],
        legs: [
          {
            from: {
              stop: {
                zoneId: 'B',
              },
            },
            to: {
              stop: {
                zoneId: 'B',
              },
            },
          },
        ],
      },
      language: 'en',
    };
    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config: {
          ...config,
          useTicketIcons: true,
        },
      },
    });

    expect(wrapper.find(ZoneTicketIcon)).to.have.lengthOf(2);
    expect(
      wrapper
        .find(ZoneTicketIcon)
        .at(0)
        .props().ticketType,
    ).to.equal('AB');
    expect(
      wrapper
        .find(ZoneTicketIcon)
        .at(1)
        .props().ticketType,
    ).to.equal('BC');
  });
});
