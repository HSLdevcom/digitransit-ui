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

export const getWeekdayInfo = (str, arr, dayNo) => {
  let weekdayText = '-';
  let allowedDiff = 1;
  switch (Array.from(new Set(arr)).length) {
    case 1:
      switch (arr[0]) {
        case '1':
          weekdayText = 'ma-ma';
          allowedDiff = 7 - dayNo + 1;
          break;
        case '2':
          weekdayText = 'ti-ti';
          if (dayNo < 2) {
            allowedDiff = 2 - dayNo;
          } else {
            allowedDiff = 7 - dayNo + 2;
          }
          break;
        case '3':
          weekdayText = 'ke-ke';
          if (dayNo < 3) {
            allowedDiff = 3 - dayNo;
          } else {
            allowedDiff = 7 - dayNo + 3;
          }
          break;
        case '4':
          weekdayText = 'to-to';
          if (dayNo < 4) {
            allowedDiff = 4 - dayNo;
          } else {
            allowedDiff = 7 - dayNo + 4;
          }
          break;
        case '5':
          weekdayText = 'pe-pe';
          if (dayNo < 5) {
            allowedDiff = 5 - dayNo;
          } else {
            allowedDiff = 7 - dayNo + 5;
          }
          break;
        case '6':
          weekdayText = 'la-la';
          if (dayNo < 6) {
            allowedDiff = 6 - dayNo;
          } else {
            allowedDiff = 7 - dayNo + 6;
          }
          break;
        case '7':
          weekdayText = 'su-su';
          if (dayNo < 7) {
            allowedDiff = 7 - dayNo;
          } else {
            allowedDiff = 7;
          }
          break;
        default:
          weekdayText = '-';
      }
      break;
    case 2:
      if (str.indexOf('56') !== -1) {
        weekdayText = 'pe-la';
        if (dayNo < 5) {
          allowedDiff = 5 - dayNo;
        } else {
          allowedDiff = 7 - dayNo + 5;
        }
        break;
      } else if (str.indexOf('67') !== -1) {
        weekdayText = 'la-su';
        if (dayNo < 6) {
          allowedDiff = 6 - dayNo;
        } else {
          allowedDiff = 7 - dayNo + 6;
        }
        break;
      }
      break;
    case 3:
      if (str.indexOf('567') !== -1) {
        weekdayText = 'pe-su';
        if (dayNo < 5) {
          allowedDiff = 5 - dayNo;
        } else {
          allowedDiff = 7 - dayNo + 5;
        }
        break;
      }
      break;
    case 5:
      if (str.indexOf('12345') !== -1) {
        weekdayText = 'ma-pe';
        if (dayNo < 5) {
          allowedDiff = 1;
        } else {
          allowedDiff = 7 - dayNo + 1;
        }
        break;
      }
      break;
    case 6:
      if (str.indexOf('123456') !== -1) {
        weekdayText = 'ma-la';
        allowedDiff = dayNo === 6 ? 2 : 1;
        break;
      } else if (str.indexOf('712345') !== -1 || str.indexOf('123457')) {
        weekdayText = 'su-pe';
        allowedDiff = dayNo === 5 ? 2 : 1;
        break;
      }
      break;
    case 7:
      if (str.indexOf('1234567') !== -1) {
        weekdayText = 'ma-su';
        allowedDiff = 1;
        break;
      }
      break;
    default:
      weekdayText = '-';
  }
  return [weekdayText, allowedDiff];
};

export const enrichPatterns = (patterns, onlyInFuture, itineraryFutureDays) => {
  const currentDate = moment();
  const lastRangeDate = moment().add(
    itineraryFutureDays === undefined ? 30 : itineraryFutureDays,
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
      x.activeDates.length > 0 &&
      moment(x.activeDates[0]).isAfter(lastRangeDate)
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

    const rangeDays = [];
    for (let z = 0; z < rangeFollowingDays.length; z++) {
      if (moment(rangeFollowingDays[z][0]).isSameOrBefore(lastRangeDate)) {
        rangeDays.push(rangeFollowingDays[z]);
      }
    }

    futureTrips[y].lastRangeDay = lastRangeDate.format(DATE_FORMAT);
    futureTrips[y].rangeFollowingDays = rangeDays;
    futureTrips[y].dayDiff = dayDiff;
    futureTrips[y].dayNumbers = dayNumbers;
    futureTrips[y].activeDates = Array.from(new Set(actDates));
    futureTrips[y].dayJoin = dayNumbers.join('');
    const dayInfo = getWeekdayInfo(
      futureTrips[y].dayJoin,
      Array.from(new Set(futureTrips[y].dayNumbers.sort())),
      Number(currentDate.format('E')),
    );
    futureTrips[y].dayString = dayInfo[0];
    futureTrips[y].allowedDiff = dayInfo[1];

    if (
      futureTrips[y].rangeFollowingDays.length === 1 &&
      futureTrips[y].rangeFollowingDays[0][0] ===
        futureTrips[y].rangeFollowingDays[0][1]
    ) {
      futureTrips[y].fromDate = futureTrips[y].rangeFollowingDays[0][0];
      futureTrips[y].untilDate = futureTrips[y].rangeFollowingDays[0][1];
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
      futureTrips[y].fromDate = moment(minAndMaxDate[0]).isAfter(
        currentDate.add(futureTrips[y].allowedDiff, 'days'),
      )
        ? `${minAndMaxDate[0]}`
        : '-';
      futureTrips[y].untilDate = moment(minAndMaxDate[1]).isBefore(
        lastRangeDate,
      )
        ? `${minAndMaxDate[1]}`
        : '-';
    }
  }

  futureTrips = futureTrips.filter(
    f => f.tripsForDate.length > 0 || f.activeDates.length > 0,
  );

  // DT-2531: shows main routes (both directions)
  if (futureTrips.length === 0 && patterns.length > 0) {
    futureTrips = patterns.filter(p => p.code.endsWith(':01'));
  }

  return futureTrips;
};

export const getOptionText = (context, pattern, isTogglable) => {
  // Starts with route info:  Keilaniemi (M) ➔ Martinlaakso as.
  let retValue = `${pattern.stops[0].name} ➔ ${pattern.headsign}`;
  if (isTogglable) {
    if (pattern.dayString !== 'ma-su') {
      retValue += context.intl.formatMessage({
        id: `route-pattern-select.range.${pattern.dayString}`,
      });
    }
    return retValue;
  }
  // Add opt #1: (vain 31.12.) or (19.-23.1.)
  if (
    // pattern.tripsForDate.length === 0 &&
    pattern.activeDates.length > 0 &&
    pattern.rangeFollowingDays.length === 1 &&
    pattern.fromDate !== '-' &&
    moment(pattern.lastRangeDay).isAfter(
      moment(pattern.rangeFollowingDays[0][1]),
    )
  ) {
    retValue += ' (';
    if (
      pattern.activeDates.length === 1 ||
      pattern.rangeFollowingDays[0][1] === 0
    ) {
      retValue += context.intl.formatMessage({
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
    retValue += context.intl
      .formatMessage({ id: `route-pattern-select.range.${pattern.dayString}` })
      .replace(/\(|\)| /gi, '');
    return retValue;
  }

  // Add opt #3b: (ma-pe), (la-su) or (ma-la)
  if (
    pattern.untilDate === '-' &&
    pattern.fromDate === '-' &&
    pattern.dayString !== 'ma-su'
  ) {
    retValue += context.intl.formatMessage({
      id: `route-pattern-select.range.${pattern.dayString}`,
    });
    return retValue;
  }

  // Add opt #4a: (31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.untilDate !== undefined &&
    pattern.dayString === 'ma-su'
  ) {
    retValue += context.intl
      .formatMessage(
        {
          id: 'route-pattern-select.until',
        },
        {
          range: context.intl
            .formatMessage({
              id: `route-pattern-select.range.${pattern.dayString}`,
            })
            .replace(/\(|\)| /gi, ''),
          day: moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2),
        },
      )
      .replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #4b: (ma-pe 31.1. saakka) or (la-su 31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.untilDate !== undefined &&
    pattern.dayString !== 'ma-su'
  ) {
    retValue += context.intl
      .formatMessage(
        {
          id: 'route-pattern-select.until',
        },
        {
          range: context.intl
            .formatMessage({
              id: `route-pattern-select.range.${pattern.dayString}`,
            })
            .replace(/\(|\)/gi, ''),
          day: moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2),
        },
      )
      .replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #5a: (1.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.fromDate !== undefined &&
    pattern.dayString === 'ma-su'
  ) {
    retValue += context.intl
      .formatMessage(
        {
          id: 'route-pattern-select.from',
        },
        {
          range: context.intl
            .formatMessage({
              id: `route-pattern-select.range.${pattern.dayString}`,
            })
            .replace(/\(|\)| /gi, ''),
          day: moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2),
        },
      )
      .replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #5b: (ma-pe 1.1. lähtien) or (la-su 31.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.fromDate !== undefined &&
    pattern.dayString !== 'ma-su'
  ) {
    retValue += context.intl
      .formatMessage(
        {
          id: 'route-pattern-select.from',
        },
        {
          range: context.intl
            .formatMessage({
              id: `route-pattern-select.range.${pattern.dayString}`,
            })
            .replace(/\(|\)/gi, ''),
          day: moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2),
        },
      )
      .replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }
  return retValue;
};
