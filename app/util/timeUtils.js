import moment from 'moment';

export const TIME_PATTERN = 'HH:mm';
export const DATE_PATTERN = 'dd D.M.';

// converts the given parameter into a string in format HHmm
// Input: time - seconds since midnight
export function getStartTime(time) {
  const hours = `0${Math.floor(time / 60 / 60)}`.slice(-2);
  const mins = `0${(time / 60) % 60}`.slice(-2);
  return hours + mins;
}

// renders trip duration to string
// input: time duration - milliseconds
export function durationToString(inDuration) {
  const duration = moment.duration(inDuration);

  if (duration.asHours() >= 1) {
    return `${duration.hours() +
      duration.days() * 24} h ${duration.minutes()} min`;
  }

  return `${duration.minutes()} min`;
}

/**
 * Returns date or '' if same day as reference
 */
export const dateOrEmpty = (momentTime, momentRefTime) => {
  if (momentTime.isSame(momentRefTime, 'day')) {
    return '';
  }
  return momentTime.format(DATE_PATTERN);
};

export const sameDay = (x, y) => dateOrEmpty(x, y) === '';

export const validateServiceTimeRange = (serviceTimeRange, now) => {
  const RANGE_PAST = 7; // sensible range as days
  const RANGE_FUTURE = 30;
  const NOW = now ? moment.unix(now) : moment();
  const START = NOW.clone()
    .subtract(RANGE_PAST, 'd')
    .unix();
  const END = NOW.clone()
    .add(RANGE_FUTURE, 'd')
    .unix();
  const NOWUX = NOW.unix();

  if (!serviceTimeRange) {
    // empty param returns a default range
    return {
      start: START,
      end: END,
    };
  }

  // always include today!
  let start = Math.min(Math.max(serviceTimeRange.start, START), NOWUX);
  // make sure whole day is included, for comparing timestamps
  start = moment
    .unix(start)
    .startOf('day')
    .unix();

  let end = Math.max(Math.min(serviceTimeRange.end, END), NOWUX);
  end = moment
    .unix(end)
    .endOf('day')
    .unix();

  return { start, end };
};
