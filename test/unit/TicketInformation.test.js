import React from 'react';
import { mountWithIntl, shallowWithIntl } from './helpers/mock-intl-enzyme';

import TicketInformation from '../../app/component/TicketInformation';
import ExternalLink from '../../app/component/ExternalLink';
import ZoneTicket from '../../app/component/ZoneTicket';
import { getFares } from '../../app/util/fareUtils';

const defaultConfig = {
  showTicketInformation: true,
  showTicketPrice: true,
  fareMapping: fareId => fareId.replace('HSL:', ''),
  hideExternalOperator: () => false,
};

const proxyFares = (fares, routes = [], config = defaultConfig) =>
  getFares(fares, routes, config);

describe('<TicketInformation />', () => {
  it('should show multiple ticket components (DT-2639)', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares([
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
      ]),
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-type-zone.multi-component')).to.have.lengthOf(
      2,
    );
  });

  it('should show a "multiple tickets required" title when there are multiple components', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares([
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
      ]),
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });
    expect(wrapper.find('.ticket-type-title').first().text()).to.equal(
      'Required tickets:',
    );
  });

  it('should not show a multiple tickets required title when there is only a single component', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: [
        {
          type: 'regular',
          cents: 550,
          components: [
            {
              cents: 550,
              fareId: 'HSL:seu',
            },
          ],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-type-title').first().text()).to.equal(
      'Required ticket:',
    );
  });

  it('should not show any ticket information if components are missing', () => {
    const props = {
      legs: [],
      fares: proxyFares([
        {
          type: 'regular',
          cents: 550,
          components: [],
        },
      ]),
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-type-zone')).to.have.lengthOf(0);
    expect(wrapper.find('.ticket-type-title')).to.have.lengthOf(0);
  });

  it('should convert and show the total fare when showTicketPrice is true', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: [
        {
          type: 'regular',
          cents: 550,
          components: [
            {
              cents: 550,
              fareId: 'HSL:seu',
            },
          ],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-description').text()).to.contain('5.50 €');
  });

  it('should not show the total fare when showTicketPrice is false', () => {
    const props = {
      legs: [],
      fares: [
        {
          type: 'regular',
          cents: 550,
          components: [
            {
              cents: 550,
              fareId: 'HSL:seu',
            },
          ],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: { ...defaultConfig, showTicketPrice: false } },
    });

    expect(wrapper.find('.ticket-description')).to.have.lengthOf(0);
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares([
        {
          type: 'regular',
          cents: 280,
          components: [
            {
              cents: 280,
              fareId: 'HSL:ABCD',
            },
          ],
        },
      ]),
    };

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...defaultConfig,
          useTicketIcons: true,
        },
      },
    });
    expect(wrapper.find(ZoneTicket)).to.have.lengthOf(1);
  });

  it('should use the mapped name for the ticket', () => {
    const config = {
      ...defaultConfig,
      fareMapping: fareId => `foo_${fareId}_bar`,
    };
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares(
        [
          {
            type: 'regular',
            cents: 280,
            components: [
              {
                cents: 280,
                fareId: 'HSL:ABCD',
              },
            ],
          },
        ],
        [],
        config,
      ),
    };

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });
    expect(wrapper.find('.ticket-identifier').text()).to.equal(
      'foo_HSL:ABCD_bar',
    );
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares([
        {
          type: 'regular',
          cents: 280,
          components: [
            {
              cents: 280,
              fareId: 'HSL:ABCD',
            },
          ],
        },
      ]),
    };

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...defaultConfig,
          useTicketIcons: true,
        },
      },
    });
    expect(wrapper.find(ZoneTicket)).to.have.lengthOf(1);
  });

  it('should show AB and BC tickets for a trip within B zone', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares([
        {
          cents: 280,
          components: [
            {
              cents: 280,
              fareId: 'HSL:AB',
            },
          ],
          type: 'regular',
        },
      ]),
      zones: ['B'],
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...defaultConfig,
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
    expect(wrapper.find(ZoneTicket).at(0).props().ticketType).to.equal('AB');
    expect(wrapper.find(ZoneTicket).at(1).props().ticketType).to.equal('BC');
  });

  it('should show a fare url link for the agency', () => {
    const props = {
      loaded: true,
      legs: [],
      fares: proxyFares([
        {
          cents: 280,
          components: [
            {
              cents: 280,
              fareId: 'HSL:AB',
              routes: [
                {
                  agency: {
                    fareUrl: 'foobar',
                    gtfsId: 'HSL:HSL',
                  },
                  gtfsId: 'HSL:1003',
                },
              ],
            },
          ],
          type: 'regular',
        },
      ]),
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config: { ...defaultConfig, ticketLink: 'foobar' } },
    });
    expect(wrapper.find(ExternalLink).first().prop('href')).to.equal('foobar');
  });

  it('should not include unknown fares to the listing', () => {
    const props = {
      legs: [
        {
          mode: 'FERRY',
          to: {
            name: 'JOTAIN',
          },
          from: {
            name: 'MUUTA',
          },
          route: {
            gtfsId: 'FOO:1234',
          },
        },
      ],
      fares: proxyFares(
        [
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
        [
          {
            agency: {
              gtfsId: 'HSL:HSL',
            },
            gtfsId: 'HSL:1003',
            longName: 'Olympiaterminaali - Eira - Kallio - Meilahti',
          },
          {
            agency: {
              fareUrl: 'foobaz',
              gtfsId: 'FOO:BAR',
              name: 'Merisataman lauttaliikenne',
            },
            gtfsId: 'FOO:1234',
            longName: 'Merisataman lautta',
          },
        ],
      ),
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config: { ...defaultConfig, ticketLink: 'foobaz' } },
    });
    expect(wrapper.find('.ticket-identifier')).to.have.lengthOf(0);
  });
});
