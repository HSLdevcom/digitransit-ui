import React from 'react';
import { mountWithIntl, shallowWithIntl } from './helpers/mock-intl-enzyme';

import TicketInformation from '../../app/component/TicketInformation';
import ZoneTicket from '../../app/component/ZoneTicket';
import { getFaresFromLegs } from '../../app/util/fareUtils';

const defaultConfig = {
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
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-type-zone.multi-component')).to.have.lengthOf(
      2,
    );
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
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });
    expect(wrapper.find('.ticket-title').first().text()).to.equal(
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
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-title').first().text()).to.equal(
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
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-type-zone')).to.have.lengthOf(0);
    expect(wrapper.find('.ticket-title')).to.have.lengthOf(0);
    expect(wrapper.find('.itinerary-ticket-type')).to.have.lengthOf(0);
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
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: defaultConfig },
    });

    expect(wrapper.find('.ticket-description').text()).to.contain('3.10 €');
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
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config: { ...defaultConfig, showTicketPrice: false } },
    });

    expect(wrapper.find('.ticket-description')).to.have.lengthOf(0);
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
      defaultConfig,
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

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });
    expect(wrapper.find('.ticket-identifier').text()).to.equal(
      'foo_HSL:AB_bar',
    );
  });

  it('should use a zone ticket icon if configured', () => {
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
        defaultConfig,
      ),
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
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...defaultConfig,
          useTicketIcons: true,
          /*  availableTickets: {
            HSL: {
              'HSL:AB': { price: 3.1, zones: ['A', 'B'] },
              'HSL:BC': { price: 3.1, zones: ['B', 'C'] },
            }, 
          }, */
        },
      },
    });

    expect(wrapper.find(ZoneTicket)).to.have.lengthOf(2);
    expect(wrapper.find(ZoneTicket).at(0).props().ticketType).to.equal('AB');
    expect(wrapper.find(ZoneTicket).at(1).props().ticketType).to.equal('BC');
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
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config: { ...defaultConfig, ticketLink: 'foobar' } },
    });
    expect(wrapper.find('a').prop('href')).to.equal('foobar');
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
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config: { ...defaultConfig, ticketLink: 'foobaz' } },
    });
    expect(wrapper.find('.ticket-identifier')).to.have.lengthOf(2);

    const ticketWrapper = wrapper.find('.ticket-type-zone').at(1);
    expect(ticketWrapper.find('.ticket-identifier').text()).to.equal(
      'Merisataman lautta',
    );
    expect(ticketWrapper.find('.ticket-description').text()).to.equal(
      'Merisataman lauttaliikenne',
    );
    expect(wrapper.find('a').prop('href')).to.equal('foobaz');
  });
});
