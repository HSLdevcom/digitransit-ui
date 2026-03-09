import { DateTime } from 'luxon';

const WEEKDAY_MAP = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

const parseScheduleKey = key => {
  const match = /^wk(\d+)(mon|tue|wed|thu|fri|sat|sun)$/.exec(key);
  if (!match) {
    return null;
  }

  return {
    weekIndex: Number(match[1]),
    dayIndex: WEEKDAY_MAP[match[2]],
  };
};

/**
 * Populate and return the list of available dates.
 * @param {Object} departures - Departures object keyed by wk{n}{day}
 * @returns {Array<DateTime>} Array of available dates
 */
export const buildAvailableDates = departures => {
  const startOfCurrentWeek = DateTime.now().startOf('week');
  const dates = [];

  if (!departures) {
    return [];
  }

  Object.entries(departures).forEach(([key, dayDepartures]) => {
    const parsed = parseScheduleKey(key);
    if (
      !parsed ||
      !Array.isArray(dayDepartures) ||
      dayDepartures.length === 0
    ) {
      return;
    }

    const date = startOfCurrentWeek.plus({
      weeks: parsed.weekIndex - 1,
      days: parsed.dayIndex - 1,
    });
    dates.push(date);
  });

  return dates;
};
