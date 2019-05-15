import React from 'react';
import { FormattedMessage } from 'react-intl';

import { mountWithIntl, shallowWithIntl } from './helpers/mock-intl-enzyme';

import ExternalLink from '../../app/component/ExternalLink';
import TicketInformation from '../../app/component/TicketInformation';
import ZoneTicketIcon from '../../app/component/ZoneTicketIcon';

describe('<TicketInformation />', () => {
  const config = {
    showTicketInformation: true,
    fareMapping: v => v,
  };

  it('should show multiple ticket components (DT-2639)', () => {
    const props = {
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
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });

    expect(wrapper.find('.ticket-type-zone.multi-component')).to.have.lengthOf(
      props.fares[0].components.length,
    );
  });

  it('should show a "multiple tickets required" title when there are multiple components', () => {
    const props = {
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
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });

    expect(
      wrapper
        .find('.ticket-type-title')
        .find(FormattedMessage)
        .prop('id'),
    ).to.equal('itinerary-tickets.title');
  });

  it('should not show a multiple tickets required title when there is only a single component', () => {
    const props = {
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
      context: { config },
    });

    expect(
      wrapper
        .find('.ticket-type-title')
        .find(FormattedMessage)
        .prop('id'),
    ).to.equal('itinerary-ticket.title');
  });

  it('should not show any ticket information if components are missing', () => {
    const props = {
      fares: [
        {
          type: 'regular',
          cents: 550,
          components: [],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });

    expect(wrapper.find('.ticket-type-zone')).to.have.lengthOf(0);
    expect(wrapper.find('.ticket-type-title')).to.have.lengthOf(0);
    expect(wrapper.find('.itinerary-ticket-type')).to.have.lengthOf(0);
  });

  it('should convert and show the total fare', () => {
    const props = {
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
      context: { config },
    });

    expect(wrapper.find('.ticket-type-zone').text()).to.contain('5.50 €');
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      fares: [
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
    };

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...config,
          useTicketIcons: true,
        },
      },
    });
    expect(wrapper.find(ZoneTicketIcon)).to.have.lengthOf(1);
  });

  it('should use the mapped name for the ticket', () => {
    const props = {
      fares: [
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
    };

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...config,
          fareMapping: fareId => `foo_${fareId}_bar`,
        },
      },
    });
    expect(wrapper.find('.ticket-identifier').text()).to.equal(
      'foo_HSL:ABCD_bar',
    );
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      fares: [
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
    };

    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...config,
          useTicketIcons: true,
        },
      },
    });
    expect(wrapper.find(ZoneTicketIcon)).to.have.lengthOf(1);
  });

  it('should show AB and BC tickets for a trip within B zone', () => {
    const props = {
      fares: [
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
      ],
      zones: ['B'],
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: {
        config: {
          ...config,
          fareMapping: fareId => fareId.replace('HSL:', ''),
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

  it('should show a fare url link for the agency', () => {
    const props = {
      fares: [
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
      ],
      zones: ['B'],
    };
    const wrapper = shallowWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });
    expect(wrapper.find(ExternalLink).prop('href')).to.equal('foobar');
  });
});
