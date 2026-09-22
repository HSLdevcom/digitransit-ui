import React from 'react';
import { renderWithProviders } from './helpers/mock-providers';

import TicketInformation from '../../app/component/itinerary/TicketInformation';
import { getFaresFromLegs } from '../../utils/client/fareUtils';

const defaultConfig = {
  CONFIG: 'default',
  showTicketInformation: true,
  showTicketPrice: true,
  fareMapping: fareId => fareId.replace('HSL:', ''),
  hideExternalOperator: () => false,
  availableTickets: {
    HSL: {
      'HSL:AB': {
        price: 3.1,
        zones: ['A', 'B'],
      },
      'HSL:BC': {
        price: 3.1,
        zones: ['B', 'C'],
      },
      'HSL:ABCD': {
        price: 4.1,
        zones: ['A', 'B', 'C', 'D'],
      },
      'HSL:BCD': {
        price: 5.1,
        zones: ['B', 'C', 'D'],
      },
    },
  },
};

describe('<TicketInformation />', () => {
  it('should show multiple ticket components (DT-2639)', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '364222a3-8acd-3096-8efd-66d047842845',
                product: {
                  id: 'HSL:BCD',
                  price: {
                    amount: 4.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
          {
            fareProducts: [
              {
                id: '65bd05fa-0e7a-33f8-9b69-2acc9fd22948',
                product: {
                  id: 'HSL:ABCD',
                  price: {
                    amount: 4.5,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: defaultConfig },
    );

    expect(
      container.querySelectorAll('.ticket-type-zone.multi-component'),
    ).toHaveLength(2);
  });

  it('should show a "multiple tickets required" title when there are multiple components', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '364222a3-8acd-3096-8efd-66d047842845',
                product: {
                  id: 'HSL:BCD',
                  price: {
                    amount: 4.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
          {
            fareProducts: [
              {
                id: '65bd05fa-0e7a-33f8-9b69-2acc9fd22948',
                product: {
                  id: 'HSL:ABCD',
                  price: {
                    amount: 4.5,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: defaultConfig },
    );
    expect(container.querySelector('.ticket-title').textContent).toBe(
      'Required tickets:',
    );
  });

  it('should not show a multiple tickets required title when there is only a single component', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: defaultConfig },
    );

    expect(container.querySelector('.ticket-title').textContent).toBe(
      'Required ticket:',
    );
  });

  it('should not show any ticket information if there are no fare products', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [],
            agency: {
              gtfsId: 'HSL:F1',
              fareUrl: 'http://www.hsl.fi/liput',
              name: 'Helsingin seudun liikenne',
              phone: '(09) 4766 4444',
            },
          },
        ],
        defaultConfig,
      ),
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: defaultConfig },
    );

    expect(container.querySelectorAll('.ticket-type-zone')).toHaveLength(0);
    expect(container.querySelectorAll('.ticket-title')).toHaveLength(0);
    expect(container.querySelectorAll('.itinerary-ticket-type')).toHaveLength(
      0,
    );
  });

  it('should convert and show the total fare when showTicketPrice is true', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '1',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: defaultConfig },
    );

    expect(
      container.querySelector('.ticket-description').textContent,
    ).toContain('3.10 €');
  });

  it('should not show the total fare when showTicketPrice is false', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: { ...defaultConfig, showTicketPrice: false } },
    );

    expect(container.querySelectorAll('.ticket-description')).toHaveLength(0);
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
    };

    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: { ...defaultConfig, useTicketIcons: true } },
    );
    expect(container.querySelectorAll('.zone-ticket')).toHaveLength(1);
  });

  it('should use the mapped name for the ticket', () => {
    const config = {
      ...defaultConfig,
      fareMapping: fareId => `foo_${fareId}_bar`,
    };
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
          },
        ],
        config,
      ),
    };

    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config },
    );
    expect(container.querySelector('.ticket-identifier').textContent).toBe(
      'foo_HSL:AB_bar',
    );
  });

  it('should show AB and BC tickets for a trip within B zone', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
      zones: ['B'],
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: { ...defaultConfig, useTicketIcons: true } },
    );

    const zoneTickets = container.querySelectorAll('.zone-ticket');
    expect(zoneTickets).toHaveLength(2);
    expect(zoneTickets[0].textContent).toBe('AB');
    expect(zoneTickets[1].textContent).toBe('BC');
  });

  it('should show a fare url link for the agency', () => {
    const props = {
      legs: [],
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },
        ],
        defaultConfig,
      ),
      ticketLink: 'foobar',
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: { ...defaultConfig } },
    );
    expect(container.querySelector('a').getAttribute('href')).toBe('foobar');
  });

  it('should include unknown fares to the listing', () => {
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
      fares: getFaresFromLegs(
        [
          {
            fareProducts: [
              {
                id: '511c1709-3a49-3e39-88d5-7bd67f845c32',
                product: {
                  id: 'HSL:AB',
                  price: {
                    amount: 3.1,
                  },
                },
              },
            ],
            route: {
              agency: {
                gtfsId: 'HSL:F1',
                fareUrl: 'http://www.hsl.fi/liput',
                name: 'Helsingin seudun liikenne',
                phone: '(09) 4766 4444',
              },
            },
          },

          {
            fareProducts: [],
            route: {
              agency: {
                fareUrl: 'foobaz',
                gtfsId: 'FOO:BAR',
                name: 'Merisataman lauttaliikenne',
              },
              gtfsId: 'FOO:1234',
              longName: 'Merisataman lautta',
            },
          },
        ],
        defaultConfig,
      ),
      ticketLink: 'foobaz',
    };
    const { container } = renderWithProviders(
      <TicketInformation {...props} />,
      { config: { ...defaultConfig } },
    );
    expect(container.querySelectorAll('.ticket-identifier')).toHaveLength(2);

    const ticketWrapper = container.querySelectorAll('.ticket-type-zone')[1];
    expect(ticketWrapper.querySelector('.ticket-identifier').textContent).toBe(
      'Merisataman lautta',
    );
    expect(ticketWrapper.querySelector('.ticket-description').textContent).toBe(
      'Merisataman lauttaliikenne',
    );
    expect(container.querySelector('a').getAttribute('href')).toBe('foobaz');
  });
});
