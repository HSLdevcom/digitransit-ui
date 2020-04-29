/**
 * Finds the allowed diff days between current day and next active day. The result will be the number from 1 to 7.
 *
 * @name dayRangeAllowedDiff
 * @param {Array} arrayOfDayNumbers Array of all pattern's unique active dates as Day Of Week (ISO) (e.g. 5,6 = only Friday and Saturday)
 * @param {number} currentDayNumber Current date's Day Of Week (ISO) (e.g. 3 = Wednesday)
 * @returns {number} Allowed diff days between current day and next service day
 * @example
 * digitransit-util.dayRangeAllowedDiff([5,6,5,6,5,6], 3);
 * //=2
 */

export default function dayRangeAllowedDiff(
  arrayOfDayNumbers,
  currentDayNumber,
) {
  const sortedUniqueDayNumbers = Array.from(new Set(arrayOfDayNumbers.sort()));
  const joinedDayNumbers = sortedUniqueDayNumbers.join('');
  let retValue = 1;
  switch (sortedUniqueDayNumbers.length) {
    case 1:
      switch (sortedUniqueDayNumbers[0]) {
        case '1':
          retValue = 7 - currentDayNumber + 1;
          break;
        case '2':
          if (currentDayNumber < 2) {
            retValue = 2 - currentDayNumber;
          } else {
            retValue = 7 - currentDayNumber + 2;
          }
          break;
        case '3':
          if (currentDayNumber < 3) {
            retValue = 3 - currentDayNumber;
          } else {
            retValue = 7 - currentDayNumber + 3;
          }
          break;
        case '4':
          if (currentDayNumber < 4) {
            retValue = 4 - currentDayNumber;
          } else {
            retValue = 7 - currentDayNumber + 4;
          }
          break;
        case '5':
          if (currentDayNumber < 5) {
            retValue = 5 - currentDayNumber;
          } else {
            retValue = 7 - currentDayNumber + 5;
          }
          break;
        case '6':
          if (currentDayNumber < 6) {
            retValue = 6 - currentDayNumber;
          } else {
            retValue = 7 - currentDayNumber + 6;
          }
          break;
        case '7':
          if (currentDayNumber < 7) {
            retValue = 7 - currentDayNumber;
          } else {
            retValue = 7;
          }
          break;
        default:
          break;
      }
      break;
    case 2:
      if (joinedDayNumbers.indexOf('56') !== -1) {
        if (currentDayNumber < 5) {
          retValue = 5 - currentDayNumber;
        } else {
          retValue = 7 - currentDayNumber + 5;
        }
        break;
      } else if (joinedDayNumbers.indexOf('67') !== -1) {
        if (currentDayNumber < 6) {
          retValue = 6 - currentDayNumber;
        } else {
          retValue = 7 - currentDayNumber + 6;
        }
        break;
      }
      break;
    case 3:
      if (joinedDayNumbers.indexOf('567') !== -1) {
        if (currentDayNumber < 5) {
          retValue = 5 - currentDayNumber;
        } else {
          retValue = currentDayNumber === 6 ? 1 : 7 - currentDayNumber + 5;
        }
        break;
      }
      break;
    case 5:
      if (joinedDayNumbers.indexOf('12345') !== -1) {
        if (currentDayNumber < 5) {
          retValue = 1;
        } else {
          retValue = 7 - currentDayNumber + 1;
        }
        break;
      }
      break;
    case 6:
      if (joinedDayNumbers.indexOf('123456') !== -1) {
        retValue = currentDayNumber === 6 ? 2 : 1;
        break;
      } else if (joinedDayNumbers.indexOf('123457') !== -1) {
        retValue = currentDayNumber === 5 ? 2 : 1;
        break;
      }
      break;
    case 7:
      if (joinedDayNumbers.indexOf('1234567') !== -1) {
        retValue = 1;
        break;
      }
      break;
    default:
      break;
  }
  return retValue;
}
