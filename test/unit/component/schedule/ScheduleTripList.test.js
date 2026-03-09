import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import ScheduleTripList from '../../../../app/component/routepage/schedule/ScheduleTripList';
import ScheduleTripRow from '../../../../app/component/routepage/schedule/ScheduleTripRow';

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
      const wrapper = shallow(<ScheduleTripList {...props} />);
      expect(wrapper.type()).to.equal(null);
    });
  });

  describe('Trip filtering', () => {
    it('should filter out trips missing fromIdx stoptime', () => {
      const trips = [
        createTrip('valid-trip', 28080, 30060),
        {
          id: 'incomplete-trip',
          stoptimes: [
            // Missing stoptime at fromIdx=0
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

      const props = { ...defaultProps, trips };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(1);
      expect(wrapper.find(ScheduleTripRow).first().key()).to.include(
        'valid-trip',
      );
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
            // Missing stoptime at toIdx=1
            null,
          ],
        },
      ];

      const props = { ...defaultProps, trips };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(1);
      expect(wrapper.find(ScheduleTripRow).first().key()).to.include(
        'valid-trip',
      );
    });

    it('should filter out trips with empty stoptimes array', () => {
      const trips = [
        createTrip('valid-trip', 28080, 30060),
        {
          id: 'no-stoptimes-trip',
          stoptimes: [],
        },
      ];

      const props = { ...defaultProps, trips };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(1);
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

      // Select stops 1 and 3 (indices 1 and 3)
      const props = { trips: [trip], fromIdx: 1, toIdx: 3 };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      const row = wrapper.find(ScheduleTripRow).first();
      // Verify times match the selected stoptimes (20000 and 40000 seconds)
      expect(row.prop('departureTime')).to.equal('05:33');
      expect(row.prop('arrivalTime')).to.equal('11:06');
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

      const props = { ...defaultProps, trips: [fullyCanceledTrip] };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      const row = wrapper.find(ScheduleTripRow).first();
      expect(row.prop('isCanceled')).to.equal(true);
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

      const props = { ...defaultProps, trips: [partiallyCanceledTrip] };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      const row = wrapper.find(ScheduleTripRow).first();
      expect(row.prop('isCanceled')).to.equal(false);
    });

    it('should not mark trip as canceled for SCHEDULED state', () => {
      const wrapper = shallow(<ScheduleTripList {...defaultProps} />);
      const row = wrapper.find(ScheduleTripRow).first();
      expect(row.prop('isCanceled')).to.equal(false);
    });

    it('should not mark trip as canceled for UPDATED state', () => {
      const trips = [createTrip('updated-trip', 28080, 30060, 'UPDATED')];
      const props = { ...defaultProps, trips };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      const row = wrapper.find(ScheduleTripRow).first();
      expect(row.prop('isCanceled')).to.equal(false);
    });
  });

  describe('Data transformation', () => {
    it('should pass formatted departure and arrival times to ScheduleTripRow', () => {
      // serviceDay: 1547503200 = 2019-01-15 00:00:00 UTC
      // 28080 seconds = 07:48
      // 30060 seconds = 08:21
      const wrapper = shallow(<ScheduleTripList {...defaultProps} />);
      const firstRow = wrapper.find(ScheduleTripRow).at(0);

      expect(firstRow.prop('departureTime')).to.equal('07:48');
      expect(firstRow.prop('arrivalTime')).to.equal('08:21');
    });

    it('should calculate times correctly for different service days', () => {
      const trip = {
        id: 'different-day',
        stoptimes: [
          {
            scheduledDeparture: 3600, // 01:00
            scheduledArrival: 3600,
            serviceDay: 1547589600, // Different day: 2019-01-16
            realtimeState: 'SCHEDULED',
          },
          {
            scheduledDeparture: 7200, // 02:00
            scheduledArrival: 7200,
            serviceDay: 1547589600,
            realtimeState: 'SCHEDULED',
          },
        ],
      };

      const props = { ...defaultProps, trips: [trip] };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      const row = wrapper.find(ScheduleTripRow).first();
      expect(row.prop('departureTime')).to.equal('01:00');
      expect(row.prop('arrivalTime')).to.equal('02:00');
    });

    it('should render one ScheduleTripRow per valid trip', () => {
      const trips = [
        createTrip('trip-1', 28080, 30060),
        createTrip('trip-2', 29080, 31060),
        createTrip('trip-3', 30080, 32060),
      ];

      const props = { ...defaultProps, trips };
      const wrapper = shallow(<ScheduleTripList {...props} />);

      expect(wrapper.find(ScheduleTripRow)).to.have.lengthOf(3);
    });
  });
});
