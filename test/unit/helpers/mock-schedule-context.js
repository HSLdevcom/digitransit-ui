import { vi } from 'vitest';
import * as ReactRelay from 'react-relay';
import * as ReactIntl from 'react-intl';
import * as ConfigContext from '../../../app/configurations/ConfigContext';
import * as scheduleParamUtils from '../../../app/component/routepage/schedule/scheduleParamUtils';
import * as scheduleDataUtils from '../../../app/component/routepage/schedule/scheduleDataUtils';
import * as scheduleTripsUtils from '../../../app/component/routepage/schedule/scheduleTripsUtils';
import { mockContext } from './mock-context';

/**
 * Create all common schedule-related stubs (auto-restored between tests via
 * `restoreMocks: true` in config/vitest.config.js).
 * Returns mocks and stubs for schedule component tests.
 *
 * @param {Object} overrides - Optional overrides for mock data
 * @param {Object} overrides.intl - Override intl mock
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
    intl: {
      formatMessage: vi.fn().mockReturnValue('translated text'),
      formatDate: vi.fn().mockReturnValue('formatted date'),
      formatTime: vi.fn().mockReturnValue('formatted time'),
      formatNumber: vi.fn().mockReturnValue('formatted number'),
      locale: 'en',
      ...overrides.intl,
    },
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
      trips: [{ id: 'trip-1', stoptimes: [] }],
      noTripsMessage: null,
      ...overrides.tripsResult,
    },
    scheduleData: overrides.scheduleData || {},
  };

  // All spies are auto-restored before each test (restoreMocks: true).
  const stubs = {
    useFragment: vi
      .spyOn(ReactRelay, 'useFragment')
      .mockImplementation((fragment, ref) => ref),
    useIntl: vi.spyOn(ReactIntl, 'useIntl').mockReturnValue(mocks.intl),
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
