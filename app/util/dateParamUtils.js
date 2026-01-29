import { DateTime } from 'luxon';

import { DATE_FORMAT } from '../constants';

export const prepareServiceDay = params => {
  return {
    ...params,
    date: DateTime.now().toFormat(DATE_FORMAT),
  };
};

export const prepareDatesForStops = params => {
  return {
    ...params,
    startTime: DateTime.now().toUnixInteger() - 60 * 5, // 5 mins in the past
    date: DateTime.now().toFormat(DATE_FORMAT),
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
