import { renderWithProviders } from '../../helpers/mock-providers';

import ScheduleTripRow from '../../../../app/component/routepage/schedule/ScheduleTripRow';

describe('<ScheduleTripRow />', () => {
  const defaultProps = { departureTime: '08:00', arrivalTime: '08:30', isCanceled: false };

  describe('Rendering times', () => {
    it('should display departure and arrival times', () => {
      const { container } = renderWithProviders(<ScheduleTripRow {...defaultProps} />);
      expect(container.querySelector('.trip-from').textContent).toBe('08:00');
      expect(container.querySelector('.trip-to').textContent).toBe('08:30');
    });

    it('should announce departure and arrival times with labels', () => {
      const { container } = renderWithProviders(<ScheduleTripRow {...defaultProps} />);
      expect(container.querySelector('.sr-only').textContent).toBe('Departs 08:00, arrives 08:30');
    });

    it('should announce a canceled trip', () => {
      const { container } = renderWithProviders(<ScheduleTripRow {...defaultProps} isCanceled />);
      expect(container.querySelector('.sr-only').textContent).toBe(
        'Departs 08:00, arrives 08:30, Canceled',
      );
    });

    it('should render arrow icon separator', () => {
      const { container } = renderWithProviders(<ScheduleTripRow {...defaultProps} />);
      expect(container.querySelectorAll('.trip-separator svg')).toHaveLength(1);
    });
  });

  describe('Canceled trips', () => {
    it('should apply canceled styling when trip is canceled', () => {
      const props = { ...defaultProps, isCanceled: true };
      const { container } = renderWithProviders(<ScheduleTripRow {...props} />);
      expect(container.querySelector('.trip-from').classList.contains('canceled')).toBe(true);
      expect(container.querySelector('.trip-to').classList.contains('canceled')).toBe(true);
    });

    it('should not apply canceled styling when isCanceled is false', () => {
      const props = { ...defaultProps, isCanceled: false };
      const { container } = renderWithProviders(<ScheduleTripRow {...props} />);
      expect(container.querySelector('.trip-from').classList.contains('canceled')).toBe(false);
      expect(container.querySelector('.trip-to').classList.contains('canceled')).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have listitem role for screen readers', () => {
      const { container } = renderWithProviders(<ScheduleTripRow {...defaultProps} />);
      expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(1);
    });

    it('should be keyboard accessible with tabIndex', () => {
      const { container } = renderWithProviders(<ScheduleTripRow {...defaultProps} />);
      expect(container.querySelector('[role="listitem"]').tabIndex).toBe(0);
    });
  });
});
