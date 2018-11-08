import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mountWithIntl, shallowWithIntl } from './helpers/mock-intl-enzyme';
import TicketInformation from '../../app/component/TicketInformation';
import ZoneTicketIcon from '../../app/component/ZoneTicketIcon';

import data from './test-data/dt2639';

describe('<TicketInformation />', () => {
  const config = {
    showTicketInformation: true,
    fareMapping: v => v,
  };

  it('should show multiple ticket components (DT-2639)', () => {
    const wrapper = mountWithIntl(<TicketInformation {...data} />, {
      context: { config },
    });

    expect(wrapper.find('.ticket-type-zone.multi-component')).to.have.lengthOf(
      data.fares[0].components.length,
    );
  });

  it('should show a "multiple tickets required" title when there are multiple components', () => {
    const props = {
      fares: [
        {
          type: 'regular',
          currency: 'EUR',
          cents: 870,
          components: [
            {
              fareId: 'HSL:esp',
            },
            {
              fareId: 'HSL:seu',
            },
          ],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });

    expect(wrapper.find('.ticket-type-title')).to.have.lengthOf(1);
  });

  it('should not show a multiple tickets required title when there is only a single component', () => {
    const props = {
      fares: [
        {
          type: 'regular',
          currency: 'EUR',
          cents: 550,
          components: [
            {
              fareId: 'HSL:seu',
            },
          ],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });

    expect(wrapper.find('.ticket-type-zone')).to.have.lengthOf(1);
    expect(wrapper.find('.ticket-type-title')).to.have.lengthOf(0);
    expect(wrapper.find('.ticket-type-zone.multi-component')).to.have.lengthOf(
      0,
    );
  });

  it('should not show any ticket information if components are missing', () => {
    const props = {
      fares: [
        {
          type: 'regular',
          currency: 'EUR',
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
          currency: 'EUR',
          cents: 550,
          components: [
            {
              fareId: 'HSL:seu',
            },
          ],
        },
      ],
    };
    const wrapper = mountWithIntl(<TicketInformation {...props} />, {
      context: { config },
    });

    expect(wrapper.find('.ticket-type-fare').text()).to.equal('5.50 €');
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      fares: [
        {
          type: 'regular',
          currency: 'EUR',
          cents: 280,
          components: [
            {
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
          currency: 'EUR',
          cents: 280,
          components: [
            {
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
    expect(wrapper.find('.ticket-type-zone').text()).to.equal(
      'foo_HSL:ABCD_bar',
    );
  });

  it('should use a zone ticket icon if configured', () => {
    const props = {
      fares: [
        {
          type: 'regular',
          currency: 'EUR',
          cents: 280,
          components: [
            {
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
          currency: 'EUR',
          components: [
            {
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
});
