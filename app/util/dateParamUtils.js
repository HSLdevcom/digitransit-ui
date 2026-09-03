import { DateTime } from 'luxon';

import { DATE_FORMAT } from '../constants';

export const prepareServiceDay = params => {
  const now = DateTime.now();
  return {
    ...params,
    date: now.toFormat(DATE_FORMAT),
    cancelationStartDate: now.toISO(),
    cancelationEndDate: now.plus({ days: 7 }).toISO(),
  };
};

export const prepareDatesForStops = params => {
  const now = DateTime.now();
  return {
    ...params,
    startTime: now.toUnixInteger() - 60 * 5, // 5 mins in the past
    date: now.toFormat(DATE_FORMAT),
    cancelationStartDate: now.toISO(),
    cancelationEndDate: now.plus({ days: 7 }).toISO(),
  };
};

/**
 * prepares weekdays for the current week
 * @param {*} params
 */
export const prepareWeekDays = params => {
  const now = DateTime.now();
  const weekdays = Array(7).map((value, weekDay) =>
    now.startOf('week').plus({ days: weekDay }).toFormat(DATE_FORMAT),
  );
  // TODO remove this hack after hsl.fi has updated its vehicle park page addresses
  const id = params.id?.includes(':') ? params.id : `liipi:${params.id}`;
  return {
    ...params,
    id,
    dates: weekdays,
  };
};
