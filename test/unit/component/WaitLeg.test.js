import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { renderWithProviders } from '../helpers/mock-providers';
import WaitLeg from '../../../app/component/itinerary/WaitLeg';

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
  describe('transit-leg marker behavior', () => {
    it('should suppress the top circle when preceded by a transit leg', () => {
      const { container } = renderWithProviders(
        <WaitLeg {...defaultProps} hasPreviousTransitLeg />,
      );
      expect(container.querySelector('.leg-before-circle.top')).to.equal(null);
    });

    it('should show the top circle by default', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(
        container.querySelectorAll('.leg-before-circle.top'),
      ).to.have.lengthOf(1);
    });

    it('should show the top circle when not preceded by a transit leg', () => {
      const { container } = renderWithProviders(
        <WaitLeg {...defaultProps} hasPreviousTransitLeg={false} />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle.top'),
      ).to.have.lengthOf(1);
    });
  });

  describe('rendering', () => {
    it('should render with wait styling', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelector('.leg-before.wait')).to.not.equal(null);
    });

    it('should not render a first-leg marker', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelector('.leg-before.first-leg')).to.equal(null);
    });

    it('should render the destination stop name', () => {
      const { container } = renderWithProviders(<WaitLeg {...defaultProps} />);
      expect(container.querySelector('.itinerary-row').textContent).to.include(
        'Stop B',
      );
      expect(
        container.querySelector('.itinerary-time-column-time').textContent,
      ).to.equal('14:48');
    });
  });
});
