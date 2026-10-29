/**
 * Finds the range pattern converted from array of pattern's unique active dates.
 *
 * @name dayRangePattern
 * @param {Array} arrayOfDayNumbers Array of pattern's unique active dates as Day Of Week (ISO) (e.g. 5,6 = only Friday and Saturday)
 * @returns {string} Range pattern
 * @example
 * digitransit-util.dayRangePattern([5,6,5,6,5,6]);
 * //='pe-la'
 */

function getSinglePattern(str) {
  let retValue = '-';
  switch (str) {
    case '1':
      retValue = 'ma-ma';
      break;
    case '2':
      retValue = 'ti-ti';
      break;
    case '3':
      retValue = 'ke-ke';
      break;
    case '4':
      retValue = 'to-to';
      break;
    case '5':
      retValue = 'pe-pe';
      break;
    case '6':
      retValue = 'la-la';
      break;
    case '7':
      retValue = 'su-su';
      break;
    default:
      break;
  }
  return retValue;
}

export default function dayRangePattern(arrayOfDayNumbers) {
  const sortedUniqueDayNumbers = Array.from(new Set(arrayOfDayNumbers.sort()));
  const joinedDayNumbers = sortedUniqueDayNumbers.join('');
  let retValue = '-';
  switch (sortedUniqueDayNumbers.length) {
    case 1:
      retValue = getSinglePattern(sortedUniqueDayNumbers[0]);
      break;
    case 2:
      if (joinedDayNumbers.indexOf('56') !== -1) {
        retValue = 'pe-la';
        break;
      } else if (joinedDayNumbers.indexOf('67') !== -1) {
        retValue = 'la-su';
        break;
      }
      break;
    case 3:
      if (joinedDayNumbers.indexOf('567') !== -1) {
        retValue = 'pe-su';
        break;
      }
      break;
    case 4:
      if (joinedDayNumbers.indexOf('1234') !== -1) {
        retValue = 'ma-to';
        break;
      }
      break;
    case 5:
      if (joinedDayNumbers.indexOf('12345') !== -1) {
        retValue = 'ma-pe';
        break;
      }
      break;
    case 6:
      if (joinedDayNumbers.indexOf('123456') !== -1) {
        retValue = 'ma-la';
        break;
      } else if (
        joinedDayNumbers.indexOf('712345') !== -1 ||
        joinedDayNumbers.indexOf('123457') !== -1
      ) {
        retValue = 'su-pe';
        break;
      }
      break;
    case 7:
      if (joinedDayNumbers.indexOf('1234567') !== -1) {
        retValue = 'ma-su';
        break;
      }
      break;
    default:
      break;
  }

  if (retValue === '-' && sortedUniqueDayNumbers.length > 1) {
    retValue = `${getSinglePattern(
      sortedUniqueDayNumbers[0],
    )},${getSinglePattern(
      sortedUniqueDayNumbers[sortedUniqueDayNumbers.length - 1],
    )}`;
  }
  return retValue;
}
