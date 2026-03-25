import { DateTime } from 'luxon';
import { routePagePath, PREFIX_TIMETABLE } from '../../../util/path';
import { DATE_FORMAT } from '../../../constants';

const populateData = (params, match, noOfWeeks) => {
  const { query } = match.location;

  const startOfWeek = DateTime.now().startOf('week');
  const date = query.serviceDay
    ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
    : null;
  const serviceDay =
    date && date.isValid && date.startOf('week') >= startOfWeek
      ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
      : DateTime.now();

  let day = startOfWeek;

  const weeks = {};
  for (let j = 0; j < noOfWeeks; j++) {
    for (let i = 0; i < 7; i++) {
      weeks[`wk${j + 1}day${i + 1}`] = day.toFormat(DATE_FORMAT);
      day = day.plus({ days: 1 });
    }
  }

  return {
    ...params,
    serviceDate: serviceDay.toFormat(DATE_FORMAT),
    date: DateTime.now().toFormat(DATE_FORMAT),
    showTenWeeks: noOfWeeks === 10,
    ...weeks,
  };
};

export function prepareScheduleParamsWithFiveWeeks(params, match) {
  return populateData(params, match, 5);
}

export function prepareScheduleParamsWithTenWeeks(params, match) {
  return populateData(params, match, 10);
}

/**
 * Determine if should redirect. Handles dates and missing pattern code.
 * @param {Object} params - Validation parameters
 * @param {DateTime} params.wantedDay - The requested service day as a DateTime object
 * @param {string|null} params.patternCode - Current pattern code
 * @param {string|null} params.routeId - Current route ID
 * @param {Array<DateTime>} [params.availableDates] - Dates that have departures, sorted ascending, no past dates
 * @param {boolean} [params.hasTrips] - Whether the wantedDay has trips
 * @returns {Object} { shouldRedirect: boolean, redirectPath: string|null, query: Object }
 */
export const calculateRedirectDecision = ({
  wantedDay,
  patternCode,
  routeId,
  availableDates,
  hasTrips,
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

  if (!hasTrips && availableDates?.length > 0) {
    const first = availableDates[0];
    if (first && first !== wantedDay) {
      return {
        shouldRedirect: true,
        redirectPath: null,
        query: { serviceDay: first.toFormat(DATE_FORMAT) },
      };
    }
  }

  return {
    shouldRedirect: false,
    redirectPath: null,
    query: {},
  };
};
