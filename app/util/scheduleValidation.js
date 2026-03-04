/**
 * Validation utilities for ScheduleContainer
 */

import { DateTime } from 'luxon';
import { routePagePath, PREFIX_TIMETABLE } from './path';
import { DATE_FORMAT } from '../constants';

/**
 * Determine if should redirect. Handles dates and missing pattern code.
 * @param {Object} params - Validation parameters
 * @param {DateTime} params.wantedDay - The requested service day as a DateTime object
 * @param {string|null} params.patternCode - Current pattern code
 * @param {string|null} params.routeId - Current route ID
 * @returns {Object} { shouldRedirect: boolean, redirectPath: string|null, query: Object }
 */
export const calculateRedirectDecision = ({
  wantedDay,
  patternCode,
  routeId,
}) => {
  const today = DateTime.now().startOf('day');
  if (wantedDay && (!wantedDay.isValid || wantedDay < today)) {
    return {
      shouldRedirect: true,
      redirectPath: null,
      query: {
        serviceDay: today.toFormat(DATE_FORMAT),
      },
    };
  }

  if (!patternCode && routeId) {
    return {
      shouldRedirect: true,
      redirectPath: routePagePath(routeId, PREFIX_TIMETABLE),
      query: {},
    };
  }

  return {
    shouldRedirect: false,
    redirectPath: null,
    query: {},
  };
};
