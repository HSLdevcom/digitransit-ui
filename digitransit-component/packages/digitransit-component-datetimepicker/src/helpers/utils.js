import moment from 'moment-timezone';

/**
 * Handle typing time and adding necessary :
 *
 * @param {string} typedValue
 *
 * @return {string}
 */
export function parseTypedTime(typedValue) {
  let actualValue = typedValue;
  if (
    actualValue.length === 3 &&
    actualValue.split('').every(n => Number.isInteger(Number(n)))
  ) {
    // add ':' if user types three numbers in a row
    if (Number(actualValue.slice(0, 2)) <= 23) {
      actualValue = `${actualValue.slice(0, 2)}:${actualValue[2]}`;
    } else {
      actualValue = `${actualValue[0]}:${actualValue.slice(1)}`;
    }
  }
  return actualValue;
}

const validateClock = (hours, minutes) => {
  const hoursValid = !Number.isNaN(hours) && hours >= 0 && hours <= 23;
  const minutesLen = minutes.length;
  const minutesValid =
    minutesLen === 2
      ? !Number.isNaN(minutes) && Number(minutes) >= 0 && Number(minutes <= 59)
      : !Number.isNaN(minutes) && Number(minutes) >= 0 && Number(minutes <= 5);
  return hoursValid && minutesValid;
};

export function validateInput(inputValue) {
  // We don't accept seconds in the input
  if (inputValue.split(':').length > 2) {
    return false;
  }
  if (inputValue.length <= 2) {
    // Too many options, don't  validate
    return true;
  }
  if (inputValue.length === 3) {
    let hours;
    let minutes;
    if (inputValue.includes(':')) {
      [hours, minutes] = inputValue.split(':');
    } else if (inputValue.startsWith('0')) {
      hours = inputValue.substring(0, inputValue.length - 1);
      minutes = inputValue.substring(inputValue.length - 1 || 0);
      if (Number(minutes) > 5) {
        return false;
      }
    } else {
      // This is how basically moment handles string formatting.
      // If the first letter of the string is 1, then rest are minutes.
      // if the first letter is 2, then if second letter is 0,1,2 or 3, then second letter is hour, else rest are minutes
      // else, first letter is hour, rest of them are minutes.
      const values = inputValue.split('');
      if (Number(values[0]) === 1) {
        [hours, minutes] = [values[0].concat(values[1]), values[2]];
      } else if (Number(values[0]) === 2) {
        if (Number(values[1] <= 3)) {
          [hours, minutes] = [values[0].concat(values[1]), values[2]];
        } else {
          [hours, minutes] = [values[0], values[1].concat(values[2])];
        }
      } else {
        [hours, minutes] = [values[0], values[1].concat(values[2])];
      }
      return validateClock(hours, minutes);
    }
    return validateClock(hours, minutes);
  }
  if (inputValue.length === 5 || inputValue.length === 4) {
    const values = inputValue.split(':');
    const hours = values[0];
    const minutes = values[1];
    if (
      inputValue.startsWith('0') &&
      minutes.length === 1 &&
      Number(minutes) > 5
    ) {
      return false;
    }

    return validateClock(hours, minutes);
  }
  return true;
}

export const getTs = (inputValue, currentTimestamp) => {
  const trimmed = inputValue.trim();
  if (trimmed.match(/^[0-9]{1,2}(\.|:)[0-9]{2}$/) !== null) {
    const splitter = trimmed.includes('.') ? '.' : ':';
    const values = trimmed.split(splitter);
    const hours = Number(values[0]);
    const hoursValid = !Number.isNaN(hours) && hours >= 0 && hours <= 23;
    const minutes = Number(values[1]);
    const minutesValid =
      !Number.isNaN(minutes) && minutes >= 0 && minutes <= 59;
    if (!minutesValid || !hoursValid) {
      return null;
    }
    const newStamp = moment(currentTimestamp)
      .hours(hours)
      .minutes(minutes)
      .valueOf();
    return newStamp;
  }
  return null;
};

export default { parseTypedTime, validateInput, getTs };
