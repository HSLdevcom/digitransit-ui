import { vi } from 'vitest';
import * as ConfigContext from '../../../app/client/ConfigContext';
import * as scheduleParamUtils from '../../../app/component/routepage/schedule/scheduleParamUtils';
import * as scheduleDataUtils from '../../../app/component/routepage/schedule/scheduleDataUtils';
import * as scheduleTripsUtils from '../../../app/component/routepage/schedule/scheduleTripsUtils';
import { mockContext } from './mock-context';

/**
 * Create all common schedule-related mocks/stubs.
 * Returns mocks and stubs for schedule component tests. Stubs are vi mocks,
 * auto-restored between tests via the `restoreMocks: true` Vitest config
 * option (vitest.config.js's `app` project) - no manual sandbox/restore needed.
 *
 * @param {Object} overrides - Optional overrides for mock data
 * @param {Object} overrides.config - Override config mock
 * @param {Object} overrides.redirectDecision - Override redirect decision
 * @param {Array} overrides.availableDates - Override available dates
 * @param {Object} overrides.tripsResult - Override trips result
 * @param {Object} overrides.scheduleData - Override schedule data
 * @returns {Object} { mocks, stubs }
 */
export const createScheduleTestContext = (overrides = {}) => {
  // Create mock objects
  const mocks = {
    config: {
      ...mockContext.config,
      URL: { ROUTE_TIMETABLES: {} },
      timetables: {},
      constantOperationRoutes: {},
      ...overrides.config,
    },
    redirectDecision: {
      shouldRedirect: false,
      redirectPath: null,
      query: {},
      ...overrides.redirectDecision,
    },
    availableDates: overrides.availableDates || [],
    tripsResult: {
      trips: [
        {
          id: 'trip-1',
          stoptimes: [
            {
              serviceDay: 1547503200,
              scheduledDeparture: 28080,
              scheduledArrival: 28080,
            },
            {
              serviceDay: 1547503200,
              scheduledDeparture: 30060,
              scheduledArrival: 30060,
            },
          ],
        },
      ],
      noTripsMessage: null,
      ...overrides.tripsResult,
    },
    scheduleData: overrides.scheduleData || {},
  };

  // useFragment isn't re-stubbed here: test/unit/helpers/vitest.setup.js
  // already stubs react-relay's useFragment globally with the same
  // pass-through behavior.
  const stubs = {
    useConfigContext: vi
      .spyOn(ConfigContext, 'useConfigContext')
      .mockReturnValue(mocks.config),
    calculateRedirectDecision: vi
      .spyOn(scheduleParamUtils, 'calculateRedirectDecision')
      .mockReturnValue(mocks.redirectDecision),
    buildAvailableDates: vi
      .spyOn(scheduleDataUtils, 'buildAvailableDates')
      .mockReturnValue(mocks.availableDates),
    getTripsList: vi
      .spyOn(scheduleTripsUtils, 'getTripsList')
      .mockReturnValue(mocks.tripsResult),
  };

  return { mocks, stubs };
};
