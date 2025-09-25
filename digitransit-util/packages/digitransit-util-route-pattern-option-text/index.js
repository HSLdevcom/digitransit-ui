/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint no-bitwise: ["error", { "allow": [">>"] }] */

import { DateTime } from 'luxon';
import i18next from 'i18next';
import translations from './helpers/translations';

const DATE_FORMAT = 'yyyyLLdd';
const DATE_FORMAT2 = 'd.L.';
const DATE_FORMAT3 = 'd.';

if (!i18next.hasLoadedNamespace('translation')) {
  i18next
    .init({
      fallbackLng: 'fi',
      defaultNS: 'translation',
      // debug: true,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      resources: {},
    })
    .then(() =>
      Object.keys(translations).forEach(l =>
        i18next.addResourceBundle(l, 'translation', translations[l], true),
      ),
    );
} else {
  Object.keys(translations).forEach(l =>
    i18next.addResourceBundle(l, 'translation', translations[l], true),
  );
}

/**
 * <DESCRIPTION>
 *
 * @name routePatternOptionText
 * @param {String} language Language of translation (e.g. 'fi', 'en' or 'sv')
 * @param {object} pattern JSON object of pattern
 * @param {boolean} isTogglable Determine what kind of component is shown (div or option)
 * @returns {String} Option text for pattern's route
 * @example
 * digitransit-util.routePatternOptionText('fi', {"code":"HSL:3002U:0:02","headsign":"Kirkkonummi","stops":[{"name":"Helsinki"},{"name":"Kirkkonummi"}],"tripsForDate":[],"activeDates":["20200221","20200222","20200228","20200229","20200306","20200307"],"rangeFollowingDays":[["20200221","20200222"],["20200228","20200229"],["20200306","20200307"]],"dayDiff":[0,1,6,1,6,1],"dayString":"pe-la","allowedDiff":2,"fromDate":"20200221","untilDate":"-"}, true);
 * //=Kirkkonummi ➔ Helsinki
 */
export default function routePatternOptionText(language, pattern, isTogglable) {
  // Starts with route info:  Kirkkonummi ➔ Helsinki
  let destinationName = pattern ? pattern.headsign : null; // DT-3422
  if (destinationName === null) {
    destinationName = pattern.stops[pattern.stops.length - 1].name;
  }
  let retValue = `${pattern.stops[0].name} ➔ ${destinationName}`;
  if (isTogglable) {
    if (pattern.dayString !== 'ma-su' && pattern.dayString !== '-') {
      retValue += i18next.t(`route-pattern-select-range-${pattern.dayString}`, {
        lng: language,
      });
    }
    return retValue;
  }
  // Add opt #1: (vain 31.12.) or (19.-23.1.)
  if (
    pattern.activeDates.length > 0 &&
    pattern.rangeFollowingDays !== undefined &&
    pattern.rangeFollowingDays.length === 1 &&
    pattern.fromDate !== '-' &&
    pattern.fromDate !== 'Invalid DateTime' &&
    pattern.untilDate !== '-' &&
    pattern.untilDate !== 'Invalid DateTime' &&
    ((pattern.lastRangeDate > pattern.rangeFollowingDays[0][1] &&
      pattern.currentDate < pattern.rangeFollowingDays[0][1]) ||
      pattern.fromDate === pattern.untilDate)
  ) {
    retValue += ' (';
    if (
      pattern.activeDates.length === 1 ||
      pattern.rangeFollowingDays[0][1] === 0
    ) {
      retValue += i18next.t('route-pattern-select-only', { lng: language });
    }

    retValue += DateTime.fromFormat(
      pattern.rangeFollowingDays[0][0],
      DATE_FORMAT,
    ).toFormat(
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
      retValue += DateTime.fromFormat(
        pattern.rangeFollowingDays[0][1],
        DATE_FORMAT,
      ).toFormat(DATE_FORMAT2);
    }
    retValue += ')';
    return retValue;
  }

  // Add opt #2: (1.1, 5.1.) or (1.1, 6.-7.1.) or (1.-5.1., 29.1.-4.2.) or (1.-5.1., 10.-17.1., 20.-25.1., ...)
  if (
    pattern.tripsForDate.length === 0 &&
    pattern.activeDates.length > 0 &&
    pattern.rangeFollowingDays !== undefined &&
    pattern.rangeFollowingDays.length > 1 &&
    pattern.dayString === '-'
  ) {
    retValue += ' (';
    retValue += DateTime.fromFormat(
      pattern.rangeFollowingDays[0][0],
      DATE_FORMAT,
    ).toFormat(
      pattern.rangeFollowingDays[0][0] !== pattern.rangeFollowingDays[0][1] &&
        (pattern.rangeFollowingDays[0][0] / 100) >> 0 ===
          (pattern.rangeFollowingDays[0][1] / 100) >> 0
        ? DATE_FORMAT3
        : DATE_FORMAT2,
    );
    if (pattern.rangeFollowingDays[0][1] !== pattern.rangeFollowingDays[0][0]) {
      retValue += '-';
      retValue += DateTime.fromFormat(
        pattern.rangeFollowingDays[0][1],
        DATE_FORMAT,
      ).toFormat(DATE_FORMAT2);
      retValue += ', ';
      retValue += DateTime.fromFormat(
        pattern.rangeFollowingDays[1][0],
        DATE_FORMAT,
      ).toFormat(
        pattern.rangeFollowingDays[1][0] !== pattern.rangeFollowingDays[1][1] &&
          (pattern.rangeFollowingDays[1][0] / 100) >> 0 ===
            (pattern.rangeFollowingDays[1][1] / 100) >> 0
          ? DATE_FORMAT3
          : DATE_FORMAT2,
      );
    }

    if (pattern.rangeFollowingDays[1][1] !== pattern.rangeFollowingDays[1][0]) {
      retValue += '-';
      retValue += DateTime.fromFormat(
        pattern.rangeFollowingDays[1][1],
        DATE_FORMAT,
      ).toFormat(DATE_FORMAT2);
    }
    if (pattern.rangeFollowingDays.length > 2) {
      retValue += ', ';
      retValue += DateTime.fromFormat(
        pattern.rangeFollowingDays[2][0],
        DATE_FORMAT,
      ).toFormat(
        pattern.rangeFollowingDays[2][0] !== pattern.rangeFollowingDays[2][1] &&
          (pattern.rangeFollowingDays[2][0] / 100) >> 0 ===
            (pattern.rangeFollowingDays[2][1] / 100) >> 0 &&
          pattern.lastRangeDate > pattern.rangeFollowingDays[2][1]
          ? DATE_FORMAT3
          : DATE_FORMAT2,
      );
      if (
        pattern.rangeFollowingDays.length > 2 &&
        pattern.rangeFollowingDays[2][1] !== pattern.rangeFollowingDays[2][0]
      ) {
        retValue += '-';
        retValue +=
          pattern.lastRangeDate > pattern.rangeFollowingDays[2][1] ||
          pattern.rangeFollowingDays.length > 3
            ? DateTime.fromFormat(
                pattern.rangeFollowingDays[2][1],
                DATE_FORMAT,
              ).toFormat(DATE_FORMAT2)
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
    return (
      retValue +
      i18next
        .t(`route-pattern-select-range-${pattern.dayString}`, { lng: language })
        .replace(/\(|\)| /gi, '')
    );
  }

  // Add opt #3b: (ma-pe), (la-su) or (ma-la)
  if (
    pattern.untilDate === '-' &&
    pattern.fromDate === '-' &&
    pattern.dayString !== 'ma-su' &&
    pattern.dayString !== '-'
  ) {
    return (
      retValue +
      i18next.t(`route-pattern-select-range-${pattern.dayString}`, {
        lng: language,
      })
    );
  }

  // Add opt #4a: (31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.dayString === 'ma-su' &&
    pattern.untilDate !== 'Invalid date' &&
    DateTime.fromFormat(pattern.untilDate, DATE_FORMAT).isValid
  ) {
    return (
      retValue +
      i18next
        .t('route-pattern-select-until', {
          lng: language,
          range: i18next
            .t(`route-pattern-select-range-${pattern.dayString}`, {
              lng: language,
            })
            .replace(/\(|\)| /gi, ''),
          day: DateTime.fromFormat(pattern.untilDate, DATE_FORMAT).toFormat(
            DATE_FORMAT2,
          ),
        })
        .replace(/\( {2}|\( |\(/gi, '(')
    );
  }

  // Add opt #4b: (ma-pe 31.1. saakka) or (la-su 31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.dayString !== 'ma-su' &&
    pattern.untilDate !== 'Invalid date' &&
    DateTime.fromFormat(pattern.untilDate, DATE_FORMAT).isValid
  ) {
    return (
      retValue +
      i18next
        .t('route-pattern-select-until', {
          lng: language,
          range: i18next
            .t(`route-pattern-select-range-${pattern.dayString}`, {
              lng: language,
            })
            .replace(/\(|\)/gi, ''),
          day: DateTime.fromFormat(pattern.untilDate, DATE_FORMAT).toFormat(
            DATE_FORMAT2,
          ),
        })
        .replace(/\( {2}|\( |\(/gi, '(')
    );
  }

  // Add opt #5a: (1.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.dayString === 'ma-su' &&
    DateTime.fromFormat(pattern.fromDate, DATE_FORMAT).isValid
  ) {
    return (
      retValue +
      i18next
        .t('route-pattern-select-from', {
          lng: language,
          range: i18next
            .t(`route-pattern-select-range-${pattern.dayString}`, {
              lng: language,
            })
            .replace(/\(|\)| /gi, ''),
          day: DateTime.fromFormat(pattern.fromDate, DATE_FORMAT).toFormat(
            DATE_FORMAT2,
          ),
        })
        .replace(/\( {2}|\( |\(/gi, '(')
    );
  }

  // Add opt #5b: (ma-pe 1.1. lähtien) or (la-su 31.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.dayString !== 'ma-su' &&
    DateTime.fromFormat(pattern.fromDate, DATE_FORMAT).isValid
  ) {
    return (
      retValue +
      i18next
        .t('route-pattern-select-from', {
          lng: language,
          range: i18next
            .t(`route-pattern-select-range-${pattern.dayString}`, {
              lng: language,
            })
            .replace(/\(|\)/gi, ''),
          day: DateTime.fromFormat(pattern.fromDate, DATE_FORMAT).toFormat(
            DATE_FORMAT2,
          ),
        })
        .replace(/\( {2}|\( |\(/gi, '(')
    );
  }
  return retValue;
}

export function getTranslatedDayString(language, dayString, clean) {
  const splittedDayStr = dayString.split(',');
  let text = i18next.t(`route-pattern-select-range-${splittedDayStr[0]}`, {
    lng: language,
  });
  if (splittedDayStr.length > 1) {
    const id = `route-pattern-select-range-${splittedDayStr[1]}`;
    text += ` - ${i18next.t(id, { lng: language })}`;
  }
  if (clean) {
    text = text.replace(/\(|\)| /gi, '');
  }
  return text;
}
