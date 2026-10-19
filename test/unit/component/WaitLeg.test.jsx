import React from 'react';
import Link from 'found/Link';

import { renderWithProviders } from '../helpers/mock-providers';
import { mockRouter } from '../helpers/mock-router';
import WaitLeg from '../../../app/component/itinerary/WaitLeg';
import { ExtendedRouteTypes } from '../../../utils/shared/constants';
import { PREFIX_STOPS } from '../../../utils/shared/path';

const renderLink = Link.render;

const defaultProps = {
  index: 1,
  focusAction: () => {},
  waitTime: 300,
  start: { scheduledTime: '2024-04-05T14:48:00.000Z' },
  leg: {
    from: { name: 'Stop A', viaLocationType: null },
    to: { name: 'Stop B', stop: { gtfsId: 'HSL:1234' } },
  },
};

describe('<WaitLeg />', () => {
  beforeEach(() => {
    vi.spyOn(Link, 'render').mockImplementation(renderLink);
  });

  describe('transit-leg marker behavior', () => {
    it('should suppress the top circle when preceded by a transit leg', () => {
      const { container } = renderWithProviders(
        <WaitLeg {...defaultProps} hasPreviousTransitLeg />,
      );
      expect(container.querySelector('.leg-before-circle.top')).toBeNull();
    });

    it('should show the top circle by default', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelectorAll('.leg-before-circle.top')).toHaveLength(
        1,
      );
    });

    it('should show the top circle when not preceded by a transit leg', () => {
      const { container } = renderWithProviders(
        <WaitLeg {...defaultProps} hasPreviousTransitLeg={false} />,
      );
      expect(container.querySelectorAll('.leg-before-circle.top')).toHaveLength(
        1,
      );
    });
  });

  describe('rendering', () => {
    it('should render a flex destination as an address without a stop link', () => {
      const { container } = renderWithProviders(
        <WaitLeg
          {...defaultProps}
          leg={{
            ...defaultProps.leg,
            route: { type: ExtendedRouteTypes.CallAgency },
            to: {
              name: 'Testikatu 12, Helsinki',
              stop: { gtfsId: 'HSL:flex-area' },
            },
          }}
        />,
        { router: { ...mockRouter, createHref: to => to } },
      );
      expect(container.querySelector('.address').textContent).toBe(
        'Testikatu 12',
      );
      expect(container.querySelector('.place').textContent).toBe('Helsinki');
      expect(container.querySelector('a')).toBeNull();
      expect(container.querySelector('.itinerary-arrow-icon')).toBeNull();
    });

    it('should preserve the stop link for an ordinary transit destination', () => {
      const { getByRole } = renderWithProviders(<WaitLeg {...defaultProps} />, {
        router: { ...mockRouter, createHref: to => to },
      });
      expect(getByRole('link', { name: 'Stop B' }).getAttribute('href')).toBe(
        `/${PREFIX_STOPS}/HSL:1234`,
      );
    });

    it('should render with wait styling', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelector('.leg-before.wait')).not.toBeNull();
    });

    it('should not render a first-leg marker', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelector('.leg-before.first-leg')).toBeNull();
    });

    it('should render the destination stop name', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelector('.itinerary-row').textContent).toContain(
        'Stop B',
      );
      expect(
        container.querySelector('.itinerary-time-column-time').textContent,
      ).toBe('14:48');
    });
  });
});
