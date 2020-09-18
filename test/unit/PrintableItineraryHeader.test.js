import React from 'react';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import { Component as PrintableItineraryHeader } from '../../app/component/PrintableItineraryHeader';
import ZoneTicket from '../../app/component/ZoneTicket';

describe('<PrintableItineraryHeader />', () => {
  const config = {
    showTicketInformation: true,
    fareMapping: fareId => fareId.replace('HSL:', ''),
    availableTickets: { HSL: { 'HSL:A': { price: 5.5, zones: ['A'] } } },
    feedIds: ['HSL', 'HSLlautta'],
  };

  it('should render as many fares as present in the itinerary', () => {
    const props = {
      itinerary: {
        fares: [
          {
            type: 'regular',
            cents: 870,
            components: [
              {
                cents: 320,
                fareId: 'HSL:esp',
              },
              {
                cents: 550,
                fareId: 'HSL:seu',
              },
            ],
          },
        ],
        legs: [{ from: {}, to: {} }],
      },
      language: 'en',
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(2);
  });

  it('should not render any fares if ticket information is disabled', () => {
    const props = {
      itinerary: {
        fares: [
          {
            type: 'regular',
            cents: 280,
            components: [
              {
                cents: 280,
                fareId: 'HSL:AB',
              },
            ],
          },
        ],
        legs: [{ from: {}, to: {} }],
      },
      language: 'en',
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config: { ...config, showTicketInformation: false },
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(0);
  });

  it('should not render the fare container if there are no fares available', () => {
    const props = {
      itinerary: {
        fares: undefined,
        legs: [{ from: {}, to: {} }],
      },
      language: 'en',
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find('.itinerary-ticket')).to.have.lengthOf(0);
  });

  it('should render unknown tickets when the total cost is unknown', () => {
    const props = {
      itinerary: {
        fares: [
          {
            cents: -1,
            components: [
              {
                cents: 280,
                fareId: 'HSL:AB',
                routes: [
                  {
                    agency: {
                      gtfsId: 'HSL:HSL',
                    },
                    gtfsId: 'HSL:1003',
                  },
                ],
              },
            ],
            type: 'regular',
          },
        ],
        legs: [
          {
            from: {},
            to: {},
            route: {
              agency: {
                gtfsId: 'HSL:HSL',
              },
              gtfsId: 'HSL:1003',
              longName: 'Olympiaterminaali - Eira - Kallio - Meilahti',
            },
            transitLeg: true,
          },
          {
            from: {},
            to: {},
            route: {
              agency: {
                fareUrl: 'foobaz',
                gtfsId: 'FOO:BAR',
                name: 'Merisataman lauttaliikenne',
              },
              gtfsId: 'FOO:1234',
              longName: 'Merisataman lautta',
            },
            transitLeg: true,
          },
        ],
      },
      language: 'en',
    };

    const wrapper = shallowWithIntl(<PrintableItineraryHeader {...props} />, {
      context: {
        config,
      },
    });
    expect(wrapper.find('.fare-details')).to.have.lengthOf(2);
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

    expect(wrapper.find(ZoneTicket)).to.have.lengthOf(1);
    expect(wrapper.find(ZoneTicket).props().ticketType).to.equal('ABCD');
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
          availableTickets: {
            HSL: {
              'HSL:AB': { price: 2.8, zones: ['A', 'B'] },
              'HSL:BC': { price: 2.8, zones: ['B', 'C'] },
            },
          },
        },
      },
    });

    expect(wrapper.find(ZoneTicket)).to.have.lengthOf(2);
    expect(
      wrapper
        .find(ZoneTicket)
        .at(0)
        .props().ticketType,
    ).to.equal('AB');
    expect(
      wrapper
        .find(ZoneTicket)
        .at(1)
        .props().ticketType,
    ).to.equal('BC');
  });
});
