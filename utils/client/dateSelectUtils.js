import { DateTime } from 'luxon';

/**
 * Generate human-readable label for a date.
 * Returns "Today", "Tomorrow", or formatted date (e.g., "Mon 15.1.").
 *
 * @param {DateTime} date - Date to label
 * @param {DateTime} today - Today's date for comparison
 * @param {DateTime} tomorrow - Tomorrow's date for comparison
 * @param {Object} intl - Internationalization object with formatMessage
 * @returns {string} Formatted label
 */
export function formatDateLabel(date, today, tomorrow, intl) {
  const isToday = date.hasSame(today, 'day');
  const isTomorrow = date.hasSame(tomorrow, 'day');

  if (isToday) {
    return intl.formatMessage({ id: 'today', defaultMessage: 'Today' });
  }
  if (isTomorrow) {
    return intl.formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' });
  }
  return date.toFormat('ccc d.L.');
}

/**
 * Generate week group label ("This week", "Next week", or "Week N").
 *
 * @param {number} weekNum - ISO week number of the group
 * @param {number} weeksFromNow - Calendar weeks between the current week and the group
 * @param {Object} intl - Internationalization object with formatMessage
 * @returns {string} Formatted group label
 */
export function formatWeekLabel(weekNum, weeksFromNow, intl) {
  if (weeksFromNow === 0) {
    return intl.formatMessage({ id: 'this-week', defaultMessage: 'This week' });
  }
  if (weeksFromNow === 1) {
    return intl.formatMessage({ id: 'next-week', defaultMessage: 'Next week' });
  }
  return intl.formatMessage(
    { id: 'week-number', defaultMessage: 'Week {number}' },
    { number: weekNum },
  );
}

/**
 * Process dates into option objects with labels and formatting.
 *
 * @param {Array<DateTime>} dates - Array of Luxon DateTime objects
 * @param {DateTime} today - Today's date for comparison
 * @param {DateTime} tomorrow - Tomorrow's date for comparison
 * @param {string} dateFormat - Format string for DateTime conversion
 * @param {Object} intl - Internationalization object
 * @returns {Array<Object>} Array of date objects with value, textLabel, weekNumber, dateObj
 */
export function processDates(dates, today, tomorrow, dateFormat, intl) {
  return dates.map(d => ({
    dateObj: d,
    value: d.toFormat(dateFormat),
    textLabel: formatDateLabel(d, today, tomorrow, intl),
    // accessibility label with full weekday
    ariaLabel: d.toFormat('EEEE d.L.'),
    weekNumber: d.weekNumber,
  }));
}

/**
 * Group dates by calendar week in chronological order, so that week 1 of the
 * next year comes after the last week of this year.
 *
 * @param {Array<Object>} processedDates - Array of processed date objects
 * @param {DateTime} today - Today's date, used to find the current week
 * @param {Object} intl - Internationalization object
 * @returns {Array<Object>} Array of grouped options with label and options
 */
export function groupDatesByWeek(processedDates, today, intl) {
  const currentWeekStart = today.startOf('week');
  const byWeek = new Map();
  processedDates.forEach(item => {
    const weekStart = item.dateObj.startOf('week');
    const key = weekStart.toISODate();
    if (!byWeek.has(key)) {
      byWeek.set(key, { weekStart, items: [] });
    }
    byWeek.get(key).items.push(item);
  });

  return [...byWeek.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, { weekStart, items }]) => ({
      label: formatWeekLabel(
        weekStart.weekNumber,
        Math.round(weekStart.diff(currentWeekStart, 'weeks').weeks),
        intl,
      ),
      options: items,
    }));
}

/**
 * Generate a range of future dates starting from a given date.
 *
 * @param {DateTime} startDate - Starting date (must be valid Luxon DateTime)
 * @param {number} numberOfDays - Number of days to generate
 * @param {string} locale - Locale string for date formatting
 * @returns {Array<DateTime>} Array of Luxon DateTime objects
 */
export function generateDateRange(startDate, numberOfDays, locale) {
  const normalizedStart = startDate.setLocale(locale).startOf('day');

  return Array.from({ length: numberOfDays }, (_, i) =>
    normalizedStart.plus({ days: i }),
  );
}

/**
 * Extract selected value from DateTime object.
 *
 * @param {DateTime} selectedDay - Selected day as a Luxon DateTime
 * @param {string} dateFormat - Format string for DateTime conversion
 * @returns {string|undefined} Formatted date string or undefined
 */
export function extractSelectedValue(selectedDay, dateFormat) {
  if (selectedDay && selectedDay instanceof DateTime && selectedDay.isValid) {
    return selectedDay.toFormat(dateFormat);
  }
  return undefined;
}
