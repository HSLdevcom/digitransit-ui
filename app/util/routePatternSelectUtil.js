/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint no-bitwise: ["error", { "allow": [">>"] }] */
/* eslint-disable prefer-destructuring */

import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';

export const DATE_FORMAT = 'YYYYMMDD';
export const DATE_FORMAT2 = 'D.M.';
export const DATE_FORMAT3 = 'D.';

/**
 * getRangeInfo
 * @description Gets needed info for later use (e.g. translations)
 * @param {string} dayNumbers All pattern's activeDates as Day Of Week (ISO) (e.g. 565656565656 = only Fridays and Saturdays)
 * @param {Array} sortedUniqueDayNumbers Array of all pattern's unique activeDates as Day Of Week (ISO) (e.g. 5,6 = only Friday and Saturday)
 * @param {number} currentDateNumber Current date's Day Of Week (ISO) (e.g. 3)
 * @returns {Array} Arrray of mixed type [string, number] e.g. ['pe-la', 2]. Default is ['-', 1];
 */
export const getRangeInfo = (
  dayNumbers,
  sortedUniqueDayNumbers,
  currentDateNumber,
) => {
  const returnArray = ['-', 1];
  switch (sortedUniqueDayNumbers.length) {
    case 1:
      switch (sortedUniqueDayNumbers[0]) {
        case '1':
          returnArray[0] = 'ma-ma';
          returnArray[1] = 7 - currentDateNumber + 1;
          break;
        case '2':
          returnArray[0] = 'ti-ti';
          if (currentDateNumber < 2) {
            returnArray[1] = 2 - currentDateNumber;
          } else {
            returnArray[1] = 7 - currentDateNumber + 2;
          }
          break;
        case '3':
          returnArray[0] = 'ke-ke';
          if (currentDateNumber < 3) {
            returnArray[1] = 3 - currentDateNumber;
          } else {
            returnArray[1] = 7 - currentDateNumber + 3;
          }
          break;
        case '4':
          returnArray[0] = 'to-to';
          if (currentDateNumber < 4) {
            returnArray[1] = 4 - currentDateNumber;
          } else {
            returnArray[1] = 7 - currentDateNumber + 4;
          }
          break;
        case '5':
          returnArray[0] = 'pe-pe';
          if (currentDateNumber < 5) {
            returnArray[1] = 5 - currentDateNumber;
          } else {
            returnArray[1] = 7 - currentDateNumber + 5;
          }
          break;
        case '6':
          returnArray[0] = 'la-la';
          if (currentDateNumber < 6) {
            returnArray[1] = 6 - currentDateNumber;
          } else {
            returnArray[1] = 7 - currentDateNumber + 6;
          }
          break;
        case '7':
          returnArray[0] = 'su-su';
          if (currentDateNumber < 7) {
            returnArray[1] = 7 - currentDateNumber;
          } else {
            returnArray[1] = 7;
          }
          break;
        default:
          returnArray[0] = '-';
      }
      break;
    case 2:
      if (dayNumbers.indexOf('56') !== -1) {
        returnArray[0] = 'pe-la';
        if (currentDateNumber < 5) {
          returnArray[1] = 5 - currentDateNumber;
        } else {
          returnArray[1] = 7 - currentDateNumber + 5;
        }
        break;
      } else if (dayNumbers.indexOf('67') !== -1) {
        returnArray[0] = 'la-su';
        if (currentDateNumber < 6) {
          returnArray[1] = 6 - currentDateNumber;
        } else {
          returnArray[1] = 7 - currentDateNumber + 6;
        }
        break;
      }
      break;
    case 3:
      if (dayNumbers.indexOf('567') !== -1) {
        returnArray[0] = 'pe-su';
        if (currentDateNumber < 5) {
          returnArray[1] = 5 - currentDateNumber;
        } else {
          returnArray[1] = 7 - currentDateNumber + 5;
        }
        break;
      }
      break;
    case 5:
      if (dayNumbers.indexOf('12345') !== -1) {
        returnArray[0] = 'ma-pe';
        if (currentDateNumber < 5) {
          returnArray[1] = 1;
        } else {
          returnArray[1] = 7 - currentDateNumber + 1;
        }
        break;
      }
      break;
    case 6:
      if (dayNumbers.indexOf('123456') !== -1) {
        returnArray[0] = 'ma-la';
        returnArray[1] = currentDateNumber === 6 ? 2 : 1;
        break;
      } else if (
        dayNumbers.indexOf('712345') !== -1 ||
        dayNumbers.indexOf('123457')
      ) {
        returnArray[0] = 'su-pe';
        returnArray[1] = currentDateNumber === 5 ? 2 : 1;
        break;
      }
      break;
    case 7:
      if (dayNumbers.indexOf('1234567') !== -1) {
        returnArray[0] = 'ma-su';
        returnArray[1] = 1;
        break;
      }
      break;
    default:
      break;
  }
  return returnArray;
};

/**
 * enrichPatterns
 * @description Manipulate patterns by adding, updating or deleting data. Mostly adding data and that's why named enrichPattern.
 * @param {object} patterns JSON array of patterns (result from GraphiQL query)
 * @param {boolean} onlyInFuture Determine is filtering used with today's past trips
 * @param {number} serviceTimeRange How many days shows in UI
 */
export const enrichPatterns = (patterns, onlyInFuture, serviceTimeRange) => {
  const currentDate = moment(moment().format(DATE_FORMAT));
  const lastRangeDate = moment(moment().format(DATE_FORMAT)).add(
    serviceTimeRange,
    'days',
  );

  let futureTrips = cloneDeep(patterns);

  if (onlyInFuture === true) {
    // DT-3182
    const wantedTime = moment().unix();
    futureTrips.forEach(function(o) {
      if (o.tripsForDate !== undefined) {
        o.tripsForDate.forEach(function(t) {
          if (t.stoptimes !== undefined) {
            t.stoptimes = t.stoptimes.filter(
              s => s.serviceDay + s.scheduledDeparture >= wantedTime,
            );
          }
        });
      }
    });
  }

  futureTrips.forEach(function(x) {
    if (x.tripsForDate !== undefined) {
      x.tripsForDate = x.tripsForDate.filter(s => s.stoptimes.length > 0);
    } else {
      x.tripsForDate = [];
    }
    const uniqueDates = [];
    if (x.activeDates !== undefined) {
      x.activeDates.forEach(function(a) {
        a.day.forEach(function(b) {
          uniqueDates.push(b);
        });
      });
    } else {
      x.activeDates = [];
    }
    x.activeDates = Array.from(new Set(uniqueDates.sort()));
    if (
      x.activeDates.length === 1 &&
      moment(x.activeDates[0], DATE_FORMAT).isAfter(lastRangeDate)
    ) {
      x.activeDates = [];
    }
  });

  futureTrips = futureTrips.filter(
    f => f.tripsForDate.length > 0 || f.activeDates.length > 0,
  );

  for (let y = 0; y < futureTrips.length; y++) {
    const actDates = [];
    const dayNumbers = [];
    const minAndMaxDate = [];
    const dayDiff = [];
    const rangeFollowingDays = [];
    futureTrips[y].activeDates.forEach(function diffBetween(item, index, arr) {
      if (!actDates.includes[item]) {
        actDates.push(item);
      }
      const itemDate = moment(arr[index]);
      if (index === 0) {
        dayDiff.push(0);
        rangeFollowingDays.push([itemDate.format(DATE_FORMAT), 0]);
        minAndMaxDate[0] = itemDate.format(DATE_FORMAT);
        minAndMaxDate[1] = itemDate.format(DATE_FORMAT);
      } else {
        if (Number(itemDate.format(DATE_FORMAT) < Number(minAndMaxDate[0]))) {
          minAndMaxDate[0] = itemDate.format(DATE_FORMAT);
        }
        if (Number(itemDate.format(DATE_FORMAT) > Number(minAndMaxDate[1]))) {
          minAndMaxDate[1] = itemDate.format(DATE_FORMAT);
        }
      }

      dayNumbers.push(itemDate.format('E'));
      if (arr[index + 1]) {
        const diff = moment(arr[index + 1], DATE_FORMAT).diff(itemDate, 'days');
        if (diff !== 1) {
          rangeFollowingDays[rangeFollowingDays.length - 1][1] = arr[index];
          rangeFollowingDays.push([arr[index + 1], 0]);
        }
        dayDiff.push(diff);
      }

      if (index + 1 === dayDiff.length && dayDiff[index] === 1) {
        rangeFollowingDays[rangeFollowingDays.length - 1][1] = arr[index];
      }
    });

    futureTrips[y].lastRangeDay = lastRangeDate.format(DATE_FORMAT);
    futureTrips[y].rangeFollowingDays = rangeFollowingDays;
    futureTrips[y].dayDiff = dayDiff;
    futureTrips[y].dayNumbers = dayNumbers;
    futureTrips[y].activeDates = Array.from(new Set(actDates));
    futureTrips[y].dayJoin = dayNumbers.join('');
    const dayInfo = getRangeInfo(
      futureTrips[y].dayJoin,
      Array.from(new Set(futureTrips[y].dayNumbers.sort())),
      Number(currentDate.format('E')),
    );
    futureTrips[y].dayString = dayInfo[0];
    futureTrips[y].allowedDiff = dayInfo[1];

    if (
      futureTrips[y].rangeFollowingDays.length === 1 &&
      (futureTrips[y].rangeFollowingDays[0][0] ===
        futureTrips[y].rangeFollowingDays[0][1] ||
        futureTrips[y].rangeFollowingDays[0][1] === 0)
    ) {
      futureTrips[y].fromDate = futureTrips[y].rangeFollowingDays[0][0];
      futureTrips[y].untilDate = futureTrips[y].rangeFollowingDays[0][0];
      futureTrips[y].rangeFollowingDays[0][1] = 0;
    } else if (
      futureTrips[y].rangeFollowingDays.length === 1 &&
      futureTrips[y].rangeFollowingDays[0][0] !==
        futureTrips[y].rangeFollowingDays[0][1]
    ) {
      if (moment(minAndMaxDate[0]).isAfter(currentDate)) {
        futureTrips[y].fromDate = futureTrips[y].rangeFollowingDays[0][0];
      } else {
        futureTrips[y].fromDate = '-';
      }
      if (
        moment(futureTrips[y].rangeFollowingDays[0][1]).isBefore(lastRangeDate)
      ) {
        futureTrips[y].untilDate = futureTrips[y].rangeFollowingDays[0][1];
      } else {
        futureTrips[y].untilDate = '-';
      }
    } else {
      futureTrips[y].fromDate = moment(minAndMaxDate[0])
        .subtract(futureTrips[y].allowedDiff, 'days')
        .isSameOrAfter(currentDate)
        ? `${minAndMaxDate[0]}`
        : '-';
      futureTrips[y].untilDate = moment(minAndMaxDate[1]).isBefore(
        lastRangeDate,
      )
        ? `${minAndMaxDate[1]}`
        : '-';
    }

    futureTrips[y].activeDates = futureTrips[y].activeDates.filter(
      ad => moment(ad, DATE_FORMAT).isSameOrAfter(currentDate) === true,
    );
  }

  futureTrips = futureTrips.filter(
    f => f.tripsForDate.length > 0 || f.activeDates.length > 0,
  );

  // DT-2531: shows main routes (both directions) if there is no futureTrips
  if (futureTrips.length === 0 && patterns.length > 0) {
    futureTrips = patterns.filter(p => p.code.endsWith(':01'));
  }

  return futureTrips;
};

/**
 * getOptionText
 * @description Shows route info (e.g. Keilaniemi (M) ➔ Martinlaakso as.) with or without additional translated texts
 * @param {function} formatMessage https://github.com/formatjs/react-intl/blob/master/docs/API.md#formatmessage
 * @param {object} pattern JSON object of pattern
 * @param {boolean} isTogglable Determine what kind of component is shown (div or option)
 */
export const getOptionText = (formatMessage, pattern, isTogglable) => {
  // Starts with route info:  Keilaniemi (M) ➔ Martinlaakso as.
  let retValue = `${pattern.stops[0].name} ➔ ${pattern.headsign}`;
  if (isTogglable) {
    if (pattern.dayString !== 'ma-su' && pattern.dayString !== '-') {
      retValue += formatMessage({
        id: `route-pattern-select.range.${pattern.dayString}`,
      });
    }
    return retValue;
  }
  // Add opt #1: (vain 31.12.) or (19.-23.1.)
  if (
    pattern.activeDates.length > 0 &&
    pattern.rangeFollowingDays.length === 1 &&
    pattern.fromDate !== '-' &&
    pattern.fromDate !== 'Invalid date' &&
    moment(pattern.lastRangeDay).isAfter(
      moment(pattern.rangeFollowingDays[0][1]),
    )
  ) {
    retValue += ' (';
    if (
      pattern.activeDates.length === 1 ||
      pattern.rangeFollowingDays[0][1] === 0
    ) {
      retValue += formatMessage({
        id: 'route-pattern-select.only',
      });
    }

    retValue += moment(pattern.rangeFollowingDays[0][0], DATE_FORMAT).format(
      pattern.rangeFollowingDays[0][1] === 0
        ? DATE_FORMAT2
        : (pattern.rangeFollowingDays[0][0] / 100) >> 0 ===
          (pattern.rangeFollowingDays[0][1] / 100) >> 0
          ? DATE_FORMAT3
          : DATE_FORMAT2,
    );

    if (
      pattern.activeDates.length > 1 &&
      pattern.rangeFollowingDays[0][1] !== 0
    ) {
      retValue += '-';
      retValue += moment(pattern.rangeFollowingDays[0][1], DATE_FORMAT).format(
        DATE_FORMAT2,
      );
    }
    retValue += ')';
    return retValue;
  }

  // Add opt #2: (1.1, 5.1.) or (1.1, 6.-7.1.) or (1.-5.1., 29.1.-4.2.) or (1.-5.1., 10.-17.1., 20.-25.1., ...)
  if (
    pattern.tripsForDate.length === 0 &&
    pattern.activeDates.length > 0 &&
    pattern.rangeFollowingDays.length > 1 &&
    pattern.dayString === '-'
  ) {
    retValue += ' (';
    retValue += moment(pattern.rangeFollowingDays[0][0], DATE_FORMAT).format(
      pattern.rangeFollowingDays[0][0] !== pattern.rangeFollowingDays[0][1] &&
      (pattern.rangeFollowingDays[0][0] / 100) >> 0 ===
        (pattern.rangeFollowingDays[0][1] / 100) >> 0
        ? DATE_FORMAT3
        : DATE_FORMAT2,
    );
    if (pattern.rangeFollowingDays[0][1] !== pattern.rangeFollowingDays[0][0]) {
      retValue += '-';
      retValue += moment(pattern.rangeFollowingDays[0][1], DATE_FORMAT).format(
        DATE_FORMAT2,
      );
      retValue += ', ';
      retValue += moment(pattern.rangeFollowingDays[1][0], DATE_FORMAT).format(
        pattern.rangeFollowingDays[1][0] !== pattern.rangeFollowingDays[1][1] &&
        (pattern.rangeFollowingDays[1][0] / 100) >> 0 ===
          (pattern.rangeFollowingDays[1][1] / 100) >> 0
          ? DATE_FORMAT3
          : DATE_FORMAT2,
      );
    }

    if (pattern.rangeFollowingDays[1][1] !== pattern.rangeFollowingDays[1][0]) {
      retValue += '-';
      retValue += moment(pattern.rangeFollowingDays[1][1], DATE_FORMAT).format(
        DATE_FORMAT2,
      );
    }
    if (pattern.rangeFollowingDays.length > 2) {
      retValue += ', ';
      retValue += moment(pattern.rangeFollowingDays[2][0], DATE_FORMAT).format(
        pattern.rangeFollowingDays[2][0] !== pattern.rangeFollowingDays[2][1] &&
        (pattern.rangeFollowingDays[2][0] / 100) >> 0 ===
          (pattern.rangeFollowingDays[2][1] / 100) >> 0 &&
        moment(pattern.lastRangeDay).isAfter(
          moment(pattern.rangeFollowingDays[2][1], DATE_FORMAT),
        )
          ? DATE_FORMAT3
          : DATE_FORMAT2,
      );
      if (
        pattern.rangeFollowingDays.length > 2 &&
        pattern.rangeFollowingDays[2][1] !== pattern.rangeFollowingDays[2][0]
      ) {
        retValue += '-';
        retValue +=
          moment(pattern.lastRangeDay).isAfter(
            moment(pattern.rangeFollowingDays[2][1], DATE_FORMAT),
          ) || pattern.rangeFollowingDays.length > 3
            ? moment(pattern.rangeFollowingDays[2][1], DATE_FORMAT).format(
                DATE_FORMAT2,
              )
            : '';
      }
      if (pattern.rangeFollowingDays.length > 3) {
        retValue += ', ...';
      }
    }
    retValue += ')';
    return retValue;
  }

  // Add opt #3a: empty
  if (
    pattern.untilDate === '-' &&
    pattern.fromDate === '-' &&
    pattern.dayString === 'ma-su'
  ) {
    retValue += formatMessage({
      id: `route-pattern-select.range.${pattern.dayString}`,
    }).replace(/\(|\)| /gi, '');
    return retValue;
  }

  // Add opt #3b: (ma-pe), (la-su) or (ma-la)
  if (
    pattern.untilDate === '-' &&
    pattern.fromDate === '-' &&
    pattern.dayString !== 'ma-su' &&
    pattern.dayString !== '-'
  ) {
    retValue += formatMessage({
      id: `route-pattern-select.range.${pattern.dayString}`,
    });
    return retValue;
  }

  // Add opt #4a: (31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.dayString === 'ma-su' &&
    pattern.untilDate !== 'Invalid date' &&
    moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += formatMessage(
      {
        id: 'route-pattern-select.until',
      },
      {
        range: formatMessage({
          id: `route-pattern-select.range.${pattern.dayString}`,
        }).replace(/\(|\)| /gi, ''),
        day: moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2),
      },
    ).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #4b: (ma-pe 31.1. saakka) or (la-su 31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.dayString !== 'ma-su' &&
    moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += formatMessage(
      {
        id: 'route-pattern-select.until',
      },
      {
        range: formatMessage({
          id: `route-pattern-select.range.${pattern.dayString}`,
        }).replace(/\(|\)/gi, ''),
        day: moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2),
      },
    ).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #5a: (1.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.dayString === 'ma-su' &&
    moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += formatMessage(
      {
        id: 'route-pattern-select.from',
      },
      {
        range: formatMessage({
          id: `route-pattern-select.range.${pattern.dayString}`,
        }).replace(/\(|\)| /gi, ''),
        day: moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2),
      },
    ).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #5b: (ma-pe 1.1. lähtien) or (la-su 31.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.dayString !== 'ma-su' &&
    moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += formatMessage(
      {
        id: 'route-pattern-select.from',
      },
      {
        range: formatMessage({
          id: `route-pattern-select.range.${pattern.dayString}`,
        }).replace(/\(|\)/gi, ''),
        day: moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2),
      },
    ).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }
  return retValue;
};
