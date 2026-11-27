import { DateTime } from 'luxon';

/**
 * Adds the ':' to a time typed as three or four digits in a row, e.g. 123 -> 12:3 and 1211 -> 12:11.
 * Other input is returned unchanged.
 *
 * @param {string} typedValue
 *
 * @return {string}
 */
export function parseTypedTime(typedValue) {
  if (!/^[0-9]{3,4}$/.test(typedValue)) {
    return typedValue;
  }
  // With three digits the hour is only two digits if it is a valid hour
  const hourLength = typedValue.length === 4 || Number(typedValue.slice(0, 2)) <= 23 ? 2 : 1;
  return `${typedValue.slice(0, hourLength)}:${typedValue.slice(hourLength)}`;
}

const isNumber = value => /^[0-9]{1,2}$/.test(value);

// Minutes can still be incomplete: a single digit can only be the tens of 0-59
const validateClock = (hours, minutes) => {
  if (!isNumber(hours) || Number(hours) > 23) {
    return false;
  }
  if (minutes === '') {
    return true;
  }
  return isNumber(minutes) && Number(minutes) <= (minutes.length === 2 ? 59 : 5);
};

/**
 * Checks that typed text is, or can still become, a valid time of day. Doesn't need a complete time.
 *
 * @param {string} inputValue
 *
 * @return {boolean}
 */
export function validateInput(inputValue) {
  const value = parseTypedTime(inputValue);
  const parts = value.split(':');
  // We don't accept seconds in the input
  if (parts.length > 2) {
    return false;
  }
  if (value.length <= 2 || value.length > 5) {
    // Too many options, don't validate
    return true;
  }
  // Three or more characters can only be a time if they contain the ':'
  const [hours, minutes] = parts;
  return minutes !== undefined && validateClock(hours, minutes);
}

export const getTs = (inputValue, currentTimestamp) => {
  const trimmed = inputValue.trim();
  if (trimmed.match(/^[0-9]{1,2}(\.|:)[0-9]{2}$/) !== null) {
    const splitter = trimmed.includes('.') ? '.' : ':';
    const values = trimmed.split(splitter);
    const hours = Number(values[0]);
    const hoursValid = !Number.isNaN(hours) && hours >= 0 && hours <= 23;
    const minutes = Number(values[1]);
    const minutesValid = !Number.isNaN(minutes) && minutes >= 0 && minutes <= 59;
    if (!minutesValid || !hoursValid) {
      return null;
    }
    const newStamp = DateTime.fromMillis(currentTimestamp)
      .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 })
      .valueOf();
    return newStamp;
  }
  return null;
};

/**
 * @param {number} date time in milliseconds since unix epoch
 * @param {function} t translation function, bound to the selected language
 * @returns {string} formatted date
 */
export const getDateDisplay = (date, t) => {
  const time = DateTime.fromMillis(date);
  const now = DateTime.now();
  let formatted;
  if (time.hasSame(now, 'day')) {
    formatted = t('today');
    formatted = `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
  } else if (time.hasSame(now.plus({ days: 1 }), 'day')) {
    formatted = t('tomorrow');
    formatted = `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
  } else {
    formatted = time.toFormat('ccc d.L.');
  }
  return formatted;
};

/**
 * @param {number} time timestamp in milliseconds
 */
export const getTimeDisplay = time => DateTime.fromMillis(time).toFormat('HH:mm');

/**
 * Builds the selectable times and dates of the picker.
 *
 * @param {object} params
 * @param {number|null} params.timestamp Selected time in milliseconds, null when "now" is selected
 * @param {number} params.displayTimestamp Time shown in the picker in milliseconds
 * @param {number} params.serviceTimeRange Number of selectable days
 * @param {number} params.stepMinutes Interval between the selectable times in minutes
 * @returns {[number[], number[]]} Time choices of the selected day and date choices, in milliseconds
 */
export const getPickerChoices = ({
  timestamp,
  displayTimestamp,
  serviceTimeRange,
  stepMinutes,
}) => {
  const selectedMoment = DateTime.fromMillis(timestamp || DateTime.now().toMillis());
  const dayStart = selectedMoment.startOf('day').toMillis();
  const dayEnd = selectedMoment.endOf('day').toMillis();
  const step = stepMinutes * 60 * 1000;
  let timeChoices = [];
  for (let time = dayStart; time <= dayEnd; time += step) {
    timeChoices.push(time);
  }
  if (timestamp === null) {
    // if time is set to now
    // add times in 5 min intervals for next 30 mins
    const fiveMinutes = 1000 * 60 * 5;
    const nextFiveMin = Math.ceil(displayTimestamp / fiveMinutes) * fiveMinutes;
    const timesToAdd = Array(7)
      .fill()
      .map((_, i) => nextFiveMin + i * fiveMinutes);
    const closestIndexAfter = timeChoices
      .map(time => displayTimestamp - time)
      .findIndex(time => time <= 0);
    timeChoices.splice(closestIndexAfter, 0, ...timesToAdd);
    timeChoices = Array.from(new Set(timeChoices)); // remove duplicates
  }
  const dateSelectStartTime = DateTime.now()
    .startOf('day')
    .set({ hour: selectedMoment.hour, minute: selectedMoment.minute });
  const dateChoices = Array(serviceTimeRange)
    .fill()
    .map((_, i) => dateSelectStartTime.plus({ days: i }).toMillis());
  return [timeChoices, dateChoices];
};

export default {
  parseTypedTime,
  validateInput,
  getTs,
  getDateDisplay,
  getTimeDisplay,
  getPickerChoices,
};
