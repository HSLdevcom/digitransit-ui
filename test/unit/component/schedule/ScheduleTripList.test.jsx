import React from 'react';
import { render } from '@testing-library/react';

import ScheduleTripList from '../../../../app/component/routepage/schedule/ScheduleTripList';

describe('<ScheduleTripList />', () => {
  const createTrip = (id, fromDep, toDep, state = 'SCHEDULED') => ({
    id,
    stoptimes: [
      {
        scheduledDeparture: fromDep,
        scheduledArrival: fromDep,
        serviceDay: 1547503200,
        realtimeState: state,
      },
      {
        scheduledDeparture: toDep,
        scheduledArrival: toDep,
        serviceDay: 1547503200,
        realtimeState: state,
      },
    ],
  });

  const defaultProps = {
    trips: [
      createTrip('trip-1', 28080, 30060),
      createTrip('trip-2', 29080, 31060),
    ],
    fromIdx: 0,
    toIdx: 1,
  };

  describe('Conditional rendering', () => {
    it('should render null when trips array is empty', () => {
      const props = { ...defaultProps, trips: [] };
      const { container } = render(<ScheduleTripList {...props} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Trip filtering', () => {
    it('should filter out trips missing fromIdx stoptime', () => {
      const trips = [
        createTrip('valid-trip', 28080, 30060),
        {
          id: 'incomplete-trip',
          stoptimes: [
            null,
            {
              scheduledDeparture: 30060,
              scheduledArrival: 30060,
              serviceDay: 1547503200,
              realtimeState: 'SCHEDULED',
            },
          ],
        },
      ];

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={trips} />,
      );

      expect(container.querySelectorAll('[role="listitem"]').length).toBe(1);
      expect(container.textContent).toContain('07:48');
      expect(container.textContent).toContain('08:21');
    });

    it('should filter out trips missing toIdx stoptime', () => {
      const trips = [
        createTrip('valid-trip', 28080, 30060),
        {
          id: 'incomplete-trip',
          stoptimes: [
            {
              scheduledDeparture: 28080,
              scheduledArrival: 28080,
              serviceDay: 1547503200,
              realtimeState: 'SCHEDULED',
            },
            null,
          ],
        },
      ];

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={trips} />,
      );

      expect(container.querySelectorAll('[role="listitem"]').length).toBe(1);
      expect(container.textContent).toContain('07:48');
    });

    it('should filter out trips with empty stoptimes array', () => {
      const trips = [
        createTrip('valid-trip', 28080, 30060),
        {
          id: 'no-stoptimes-trip',
          stoptimes: [],
        },
      ];

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={trips} />,
      );

      expect(container.querySelectorAll('[role="listitem"]').length).toBe(1);
    });

    it('should use correct fromIdx and toIdx when extracting stoptimes', () => {
      const trip = {
        id: 'multi-stop-trip',
        stoptimes: [
          {
            scheduledDeparture: 10000,
            scheduledArrival: 10000,
            serviceDay: 1547503200,
            realtimeState: 'SCHEDULED',
          },
          {
            scheduledDeparture: 20000,
            scheduledArrival: 20000,
            serviceDay: 1547503200,
            realtimeState: 'SCHEDULED',
          },
          {
            scheduledDeparture: 30000,
            scheduledArrival: 30000,
            serviceDay: 1547503200,
            realtimeState: 'SCHEDULED',
          },
          {
            scheduledDeparture: 40000,
            scheduledArrival: 40000,
            serviceDay: 1547503200,
            realtimeState: 'SCHEDULED',
          },
        ],
      };

      const { container } = render(
        <ScheduleTripList trips={[trip]} fromIdx={1} toIdx={3} />,
      );

      expect(container.textContent).toContain('05:33');
      expect(container.textContent).toContain('11:06');
    });
  });

  describe('Cancellation logic', () => {
    it('should mark trip as canceled when all stoptimes are CANCELED', () => {
      const fullyCanceledTrip = {
        id: 'fully-canceled',
        stoptimes: [
          {
            scheduledDeparture: 28080,
            scheduledArrival: 28080,
            serviceDay: 1547503200,
            realtimeState: 'CANCELED',
          },
          {
            scheduledDeparture: 30060,
            scheduledArrival: 30060,
            serviceDay: 1547503200,
            realtimeState: 'CANCELED',
          },
        ],
      };

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={[fullyCanceledTrip]} />,
      );

      expect(container.querySelector('.trip-from.canceled')).not.toBeNull();
      expect(container.querySelector('.trip-to.canceled')).not.toBeNull();
    });

    it('should not mark trip as canceled when only some stoptimes are CANCELED', () => {
      const partiallyCanceledTrip = {
        id: 'partial-trip',
        stoptimes: [
          {
            scheduledDeparture: 28080,
            scheduledArrival: 28080,
            serviceDay: 1547503200,
            realtimeState: 'CANCELED',
          },
          {
            scheduledDeparture: 30060,
            scheduledArrival: 30060,
            serviceDay: 1547503200,
            realtimeState: 'SCHEDULED',
          },
        ],
      };

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={[partiallyCanceledTrip]} />,
      );

      expect(container.querySelector('.trip-from.canceled')).toBeNull();
      expect(container.querySelector('.trip-to.canceled')).toBeNull();
    });

    it('should not mark trip as canceled for SCHEDULED state', () => {
      const { container } = render(<ScheduleTripList {...defaultProps} />);
      expect(container.querySelector('.trip-from.canceled')).toBeNull();
      expect(container.querySelector('.trip-to.canceled')).toBeNull();
    });

    it('should not mark trip as canceled for UPDATED state', () => {
      const trips = [createTrip('updated-trip', 28080, 30060, 'UPDATED')];
      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={trips} />,
      );

      expect(container.querySelector('.trip-from.canceled')).toBeNull();
      expect(container.querySelector('.trip-to.canceled')).toBeNull();
    });
  });

  describe('Data transformation', () => {
    it('should pass formatted departure and arrival times to ScheduleTripRow', () => {
      const { container } = render(<ScheduleTripList {...defaultProps} />);
      expect(container.textContent).toContain('07:48');
      expect(container.textContent).toContain('08:21');
    });

    it('should calculate times correctly for different service days', () => {
      const trip = {
        id: 'different-day',
        stoptimes: [
          {
            scheduledDeparture: 3600,
            scheduledArrival: 3600,
            serviceDay: 1547589600,
            realtimeState: 'SCHEDULED',
          },
          {
            scheduledDeparture: 7200,
            scheduledArrival: 7200,
            serviceDay: 1547589600,
            realtimeState: 'SCHEDULED',
          },
        ],
      };

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={[trip]} />,
      );

      expect(container.textContent).toContain('01:00');
      expect(container.textContent).toContain('02:00');
    });

    it('should render one ScheduleTripRow per valid trip', () => {
      const trips = [
        createTrip('trip-1', 28080, 30060),
        createTrip('trip-2', 29080, 31060),
        createTrip('trip-3', 30080, 32060),
      ];

      const { container } = render(
        <ScheduleTripList {...defaultProps} trips={trips} />,
      );

      expect(container.querySelectorAll('[role="listitem"]').length).toBe(3);
    });
  });
});
