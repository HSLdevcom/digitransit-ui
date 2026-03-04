import sinon from 'sinon';
import * as ReactRelay from 'react-relay';
import * as useTranslationsContext from '../../../app/util/useTranslationsContext';
import * as ConfigContext from '../../../app/configurations/ConfigContext';
import * as scheduleValidation from '../../../app/util/scheduleValidation';
import * as scheduleDataUtils from '../../../app/util/scheduleDataUtils';
import * as scheduleTripsUtils from '../../../app/util/scheduleTripsUtils';
import * as scheduleRedirectHook from '../../../app/hooks/useRouterRedirect';
import { mockContext } from './mock-context';

/**
 * Create a sandbox and all common schedule-related stubs.
 * Returns sandbox, mocks, and stubs for schedule component tests.
 *
 * @param {Object} overrides - Optional overrides for mock data
 * @param {Object} overrides.intl - Override intl mock
 * @param {Object} overrides.config - Override config mock
 * @param {Object} overrides.redirectDecision - Override redirect decision
 * @param {Array} overrides.availableDates - Override available dates
 * @param {Object} overrides.tripsResult - Override trips result
 * @param {Object} overrides.scheduleData - Override schedule data
 * @returns {Object} { sandbox, mocks, stubs }
 */
export const createScheduleTestContext = (overrides = {}) => {
  const sandbox = sinon.createSandbox();

  // Create mock objects
  const mocks = {
    intl: {
      formatMessage: sandbox.stub().returns('translated text'),
      formatDate: sandbox.stub().returns('formatted date'),
      formatTime: sandbox.stub().returns('formatted time'),
      formatNumber: sandbox.stub().returns('formatted number'),
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

  // Create stubs - all use the sandbox for automatic cleanup
  const stubs = {
    useFragment: sandbox
      .stub(ReactRelay, 'useFragment')
      .callsFake((fragment, ref) => ref),
    useTranslationsContext: sandbox
      .stub(useTranslationsContext, 'useTranslationsContext')
      .returns(mocks.intl),
    useConfigContext: sandbox
      .stub(ConfigContext, 'useConfigContext')
      .returns(mocks.config),
    calculateRedirectDecision: sandbox
      .stub(scheduleValidation, 'calculateRedirectDecision')
      .returns(mocks.redirectDecision),
    buildAvailableDates: sandbox
      .stub(scheduleDataUtils, 'buildAvailableDates')
      .returns(mocks.availableDates),
    getTripsList: sandbox
      .stub(scheduleTripsUtils, 'getTripsList')
      .returns(mocks.tripsResult),
    useRouterRedirect: sandbox
      .stub(scheduleRedirectHook, 'useRouterRedirect')
      .returns(undefined),
  };

  return { sandbox, mocks, stubs };
};

/**
 * Create a simple context for components that only need intl and config.
 *
 * @param {Object} overrides - Optional overrides
 * @param {Object} overrides.intl - Override intl mock
 * @param {Object} overrides.config - Override config mock
 * @returns {Object} { sandbox, mocks, stubs }
 */
export const createSimpleTestContext = (overrides = {}) => {
  const sandbox = sinon.createSandbox();

  const mocks = {
    intl: {
      formatMessage: sandbox.stub().returns('translated text'),
      locale: 'en',
      ...overrides.intl,
    },
    config: {
      ...mockContext.config,
      ...overrides.config,
    },
  };

  const stubs = {
    useTranslationsContext: sandbox
      .stub(useTranslationsContext, 'useTranslationsContext')
      .returns(mocks.intl),
    useConfigContext: sandbox
      .stub(ConfigContext, 'useConfigContext')
      .returns(mocks.config),
  };

  return { sandbox, mocks, stubs };
};
