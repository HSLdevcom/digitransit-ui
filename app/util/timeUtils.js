import { DateTime } from 'luxon';

export const TIME_PATTERN = 'HH:mm';
export const DATE_PATTERN = 'ccc d.L.';

/**
 * converts the given parameter into a string in format HHmm
 * @param {number} seconds seconds since midnight
 * @returns {string} time in format HHmm
 */
export function getStartTime(seconds) {
  const hours = `0${Math.floor(seconds / 60 / 60)}`.slice(-2);
  const mins = `0${(seconds / 60) % 60}`.slice(-2);
  return hours + mins;
}

/**
 * converts the given parameter into a string in format HH:mm
 * @param {number} seconds seconds since midnight
 * @returns {string} time in format HH:mm
 */
export function getStartTimeWithColon(seconds) {
  const hours = `0${Math.floor(seconds / 60 / 60)}`.slice(-2);
  const mins = `0${(seconds / 60) % 60}`.slice(-2);
  return `${hours}:${mins}`;
}

/**
 * @param {number} startTime milliseconds since 1970 UTC
 * @param {number} [refTime] milliseconds since 1970 UTC
 * @returns {boolean} true if startTime is the same day compared to refTime or if refTime is not given and startTime is today
 */
export function isToday(startTime, refTime) {
  const now = refTime ? DateTime.fromMillis(refTime) : DateTime.now();
  const start = DateTime.fromMillis(startTime);
  return start.hasSame(now, 'day');
}

/**
 * @param {number} startTime milliseconds since 1970 UTC
 * @param {number} [refTime] milliseconds since 1970 UTC
 * @returns {boolean} true if startTime is the next day compared to refTime and refTime is some time in current day
 */
export function isTomorrow(startTime, refTime) {
  const now = refTime ? DateTime.fromMillis(refTime) : DateTime.now();
  const start = DateTime.fromMillis(startTime);
  return (
    now.plus({ days: 1 }).hasSame(start, 'day') &&
    DateTime.now().hasSame(now, 'day')
  );
}

/**
 * renders trip duration to string
 * @param {number} durationMs duration in ms
 * @returns {string} duration formatted in hours and minutes
 */
export function durationToString(durationMs) {
  const dur = Math.max(durationMs, 0);
  const hours = Math.floor(dur / 3600000);
  const mins = Math.floor(dur / 60000 - hours * 60);
  if (hours >= 1) {
    if (mins > 0) {
      return `${hours} h ${mins} min`;
    }
    return `${hours} h`;
  }
  if (mins < 1) {
    return '<1 min';
  }
  return `${mins} min`;
}

/**
 * Returns formatted date / time
 * @param {number} startTime milliseconds since 1970 UTC
 * @param {string} pattern format string using luxon tokens
 * @returns {string} formatted date
 */
export function getFormattedTimeDate(startTime, pattern) {
  return DateTime.fromMillis(startTime).toFormat(pattern);
}

/**
 *
 * @param {number} time milliseconds since 1970 UTC
 * @param {number} refTime milliseconds since 1970 UTC
 * @returns {string} date or '' if same day as reference
 */
export const dateOrEmpty = (time, refTime) => {
  const date = DateTime.fromMillis(time);
  const refDate = DateTime.fromMillis(refTime);
  if (date.hasSame(refDate, 'day')) {
    return '';
  }
  return date.toFormat(DATE_PATTERN);
};

/**
 * Returns a localized date string if start time is not today
 * @param {string} itineraryStart ISO date time
 * @param {object} intl
 * @returns {string} localized date
 */
export function getFutureText(itineraryStart, intl) {
  const startTime = Date.parse(itineraryStart);
  const refTime = Date.now();
  if (isToday(startTime, refTime)) {
    return '';
  }
  if (isTomorrow(startTime, refTime)) {
    return intl.formatMessage({
      id: 'tomorrow',
    });
  }
  return getFormattedTimeDate(startTime, 'ccc d.L.');
}

/**
 * The default number of days to include to the service time range from the past.
 */
export const RANGE_PAST = 7;

/**
 *
 * @param {number} [itineraryFutureDays]
 * @param {object} [serviceTimeRange]
 * @param {number} [now] seconds since 1970 UTC
 * @returns
 */
export const validateServiceTimeRange = (
  itineraryFutureDays,
  serviceTimeRange,
  now,
) => {
  const nowDate = now ? DateTime.fromSeconds(now) : DateTime.now();
  const rangeFuture = !itineraryFutureDays ? 30 : itineraryFutureDays;
  const startSeconds = nowDate
    .minus({
      days: RANGE_PAST,
    })
    .toSeconds();
  const endSeconds = nowDate
    .plus({
      days: rangeFuture,
    })
    .toSeconds();
  const nowSeconds = nowDate.toSeconds();

  if (!serviceTimeRange) {
    // empty param returns a default range
    return {
      start: startSeconds,
      end: endSeconds,
    };
  }

  // always include today!
  let start = Math.min(
    Math.max(serviceTimeRange.start, startSeconds),
    nowSeconds,
  );
  // make sure whole day is included, for comparing timestamps
  start = DateTime.fromSeconds(start).startOf('day').toSeconds();

  let end = Math.max(Math.min(serviceTimeRange.end, endSeconds), nowSeconds);
  end = DateTime.fromSeconds(end).endOf('day').toSeconds();
  return { start, end };
};

/**
 * @returns {number} current time as seconds since 1970 UTC
 */
export function getCurrentSecs() {
  return DateTime.now().toSeconds();
}

/**
 * converts time from 24+ hour HHmm to 24 hour HH:mm format
 * @param {string} time
 * @returns {string}
 */
export function convertTo24HourFormat(time) {
  if (time.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return time;
  }
  return parseInt(time.substring(0, 2), 10) > 23
    ? `0${parseInt(time.substring(0, 2), 10) - 24}:${time.substring(2, 4)}`
    : `${time.substring(0, 2)}:${time.substring(2, 4)}`;
}

/**
 * Epoch ms to 'hh:mm'
 * @param {number} ms milliseconds since 1970 UTC
 * @param {object} config
 * @returns {string} time in 'hh:mm'
 */
export function epochToTime(ms, config) {
  const time = new Date(ms).toLocaleTimeString('en-GB', {
    timeZone: config.timeZone,
  });
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Unix time as seconds (from epoch milliseconds if given)
 * @param {number} [ms] milliseconds since 1970 UTC
 * @returns {number} seconds since 1970
 */
export function unixTime(ms) {
  const t = ms || Date.now();
  return Math.floor(t / 1000);
}

/**
 * Unix to 'YYYYMMDD'
 * @param {number} s seconds since 1970 UTC
 * @param {object} config config containing timeZone
 * @returns {string} date in 'YYYYMMDD'
 */
export function unixToYYYYMMDD(s, config) {
  const date = new Date(s * 1000).toLocaleDateString('en-GB', {
    timeZone: config.timeZone,
  });
  const parts = date.split('/');
  return `${parts[2]}${parts[1]}${parts[0]}`;
}

/**
 * ISO-8601/RFC3339 datetime str to 'hh:mm'
 * @param {string} dateTime ISO-8601/RFC3339 datetime
 * @returns {string} time in 'hh:mm'
 */
export function timeStr(dateTime) {
  // e.g. "2024-06-13T14:30+03:00"
  const parts = dateTime.split('T');
  const time = parts[1].split(':');
  return `${time[0]}:${time[1]}`;
}

/**
 * Epoch ms to ISO-8601/RFC3339 datetime str
 * @param {number} ms milliseconds since 1970 UTC
 * @returns {string} ISO-8601/RFC3339 datetime str
 */
export function epochToIso(ms) {
  return DateTime.fromMillis(ms).toISO();
}
