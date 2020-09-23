import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { DepartureRow } from '../../../app/component/DepartureRowContainer';
import RouteNumberContainer from '../../../app/component/RouteNumberContainer';
import {
  RealtimeStateType,
  AlertSeverityLevelType,
} from '../../../app/constants';

describe('<DepartureRow />', () => {
  it('should indicate that there is a disruption due to a cancelation ', () => {
    const props = {
      currentTime: 1500,
      departure: {
        pattern: {
          code: 'HSL:2550:0:01',
          headsign: 'Westendinasema',
          route: {
            agency: {
              name: 'Helsingin seudun liikenne',
            },
            alerts: [],
            color: null,
            gtfsId: 'HSL:2550',
            longName: 'Itäkeskus-Westendinasema',
            mode: 'BUS',
            shortName: '550',
          },
        },
        stoptimes: [
          {
            pickupType: 'SCHEDULED',
            realtime: true,
            realtimeArrival: 40179,
            realtimeDeparture: 40191,
            realtimeState: RealtimeStateType.Canceled,
            scheduledArrival: 400,
            scheduledDeparture: 500,
            serviceDay: 1000,
            stop: {
              alerts: [],
              code: 'E2006',
              platformCode: '7',
              headsign: 'Westendinas.',
            },
            trip: {
              gtfsId: 'HSL:2550_20190322_Ma_1_1011',
            },
          },
        ],
      },
      distance: 272,
      timeRange: 7200,
    };
    const wrapper = mountWithIntl(
      <table>
        <tbody>
          <DepartureRow {...props} />
        </tbody>
      </table>,
      {
        context: mockContext,
        childContextTypes: mockChildContextTypes,
      },
    );
    expect(wrapper.find(RouteNumberContainer).props().hasDisruption).to.equal(
      true,
    );
  });

  it('should indicate that there is a disruption due to a stop service alert', () => {
    const currentTime = 1553504950;
    const props = {
      currentTime,
      departure: {
        pattern: {
          code: 'HSL:2550:0:01',
          headsign: 'Westendinasema',
          route: {
            agency: {
              name: 'Helsingin seudun liikenne',
            },
            alerts: [],
            color: null,
            gtfsId: 'HSL:2550',
            longName: 'Itäkeskus-Westendinasema',
            mode: 'BUS',
            shortName: '550',
          },
        },
        stoptimes: [
          {
            pickupType: 'SCHEDULED',
            realtime: true,
            realtimeArrival: 40179,
            realtimeDeparture: 40191,
            realtimeState: RealtimeStateType.Updated,
            scheduledArrival: 40020,
            scheduledDeparture: 40020,
            serviceDay: 1553464800,
            stop: {
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  effectiveEndDate: currentTime + 2000,
                  effectiveStartDate: currentTime - 2000,
                },
              ],
              code: 'E2006',
              platformCode: '7',
              headsign: 'Westendinas.',
            },
            trip: {
              gtfsId: 'HSL:2550_20190322_Ma_1_1011',
            },
          },
        ],
      },
      distance: 272,
      timeRange: 7200,
    };
    const wrapper = mountWithIntl(
      <table>
        <tbody>
          <DepartureRow {...props} />
        </tbody>
      </table>,
      {
        context: mockContext,
        childContextTypes: mockChildContextTypes,
      },
    );
    expect(wrapper.find(RouteNumberContainer).props().hasDisruption).to.equal(
      true,
    );
  });

  it('should indicate that there is a disruption due to a route service alert', () => {
    const currentTime = 1553504950;
    const props = {
      currentTime,
      departure: {
        pattern: {
          code: 'HSL:2550:0:01',
          headsign: 'Westendinasema',
          route: {
            agency: {
              name: 'Helsingin seudun liikenne',
            },
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                effectiveEndDate: currentTime + 2000,
                effectiveStartDate: currentTime - 2000,
                trip: {
                  pattern: {
                    code: 'HSL:2550:0:01',
                  },
                },
              },
            ],
            color: null,
            gtfsId: 'HSL:2550',
            longName: 'Itäkeskus-Westendinasema',
            mode: 'BUS',
            shortName: '550',
          },
        },
        stoptimes: [
          {
            pickupType: 'SCHEDULED',
            realtime: true,
            realtimeArrival: 40179,
            realtimeDeparture: 40191,
            realtimeState: RealtimeStateType.Updated,
            scheduledArrival: 40020,
            scheduledDeparture: 40020,
            serviceDay: 1553464800,
            stop: {
              alerts: [],
              code: 'E2006',
              platformCode: '7',
              headsign: 'Westendinas.',
            },
            trip: {
              gtfsId: 'HSL:2550_20190322_Ma_1_1011',
            },
          },
        ],
      },
      distance: 272,
      timeRange: 7200,
    };
    const wrapper = mountWithIntl(
      <table>
        <tbody>
          <DepartureRow {...props} />
        </tbody>
      </table>,
      {
        context: mockContext,
        childContextTypes: mockChildContextTypes,
      },
    );
    expect(wrapper.find(RouteNumberContainer).props().hasDisruption).to.equal(
      true,
    );
  });
});
