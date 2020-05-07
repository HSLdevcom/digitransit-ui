/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint no-bitwise: ["error", { "allow": [">>"] }] */

import moment from 'moment';
import i18next from 'i18next';
import translations from './helpers/translations';

const DATE_FORMAT = 'YYYYMMDD';
const DATE_FORMAT2 = 'D.M.';
const DATE_FORMAT3 = 'D.';

i18next.init({ lng: 'en', resources: {} });

i18next.addResourceBundle('da', 'translation', translations.da);
i18next.addResourceBundle('de', 'translation', translations.de);
i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('es', 'translation', translations.es);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('fr', 'translation', translations.fr);
i18next.addResourceBundle('nb', 'translation', translations.nb);
i18next.addResourceBundle('ro', 'translation', translations.ro);
i18next.addResourceBundle('sv', 'translation', translations.sv);

function translateText(objectToTranslate) {
  if (
    objectToTranslate.range === undefined &&
    objectToTranslate.day === undefined
  ) {
    return i18next.t(objectToTranslate.id);
  }
  return i18next.t(objectToTranslate.id, {
    range: objectToTranslate.range,
    day: objectToTranslate.day,
  });
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
  i18next.changeLanguage(language);
  // Starts with route info:  Kirkkonummi ➔ Helsinki
  let destinationName = pattern.headsign; // DT-3422
  if (destinationName === null) {
    destinationName = pattern.stops[pattern.stops.length - 1].name;
  }
  let retValue = `${pattern.stops[0].name} ➔ ${destinationName}`;
  if (isTogglable) {
    if (pattern.dayString !== 'ma-su' && pattern.dayString !== '-') {
      retValue += translateText({
        id: `route-pattern-select-range-${pattern.dayString}`,
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
    pattern.fromDate !== 'Invalid date' &&
    pattern.untilDate !== '-' &&
    pattern.untilDate !== 'Invalid date' &&
    ((moment(pattern.lastRangeDate).isAfter(
      moment(pattern.rangeFollowingDays[0][1]),
    ) &&
      moment(pattern.currentDate).isBefore(
        moment(pattern.rangeFollowingDays[0][1]),
      )) ||
      pattern.fromDate === pattern.untilDate)
  ) {
    retValue += ' (';
    if (
      pattern.activeDates.length === 1 ||
      pattern.rangeFollowingDays[0][1] === 0
    ) {
      retValue += translateText({
        id: 'route-pattern-select-only',
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
    pattern.rangeFollowingDays !== undefined &&
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
        moment(pattern.lastRangeDate).isAfter(
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
          moment(pattern.lastRangeDate).isAfter(
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
    retValue += translateText({
      id: `route-pattern-select-range-${pattern.dayString}`,
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
    retValue += translateText({
      id: `route-pattern-select-range-${pattern.dayString}`,
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
    retValue += translateText({
      id: 'route-pattern-select-until',
      range: translateText({
        id: `route-pattern-select-range-${pattern.dayString}`,
      }).replace(/\(|\)| /gi, ''),
      day: moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2),
    }).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #4b: (ma-pe 31.1. saakka) or (la-su 31.1. saakka)
  if (
    pattern.untilDate !== '-' &&
    pattern.dayString !== 'ma-su' &&
    pattern.untilDate !== 'Invalid date' &&
    moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += translateText({
      id: 'route-pattern-select-until',
      range: translateText({
        id: `route-pattern-select-range-${pattern.dayString}`,
      }).replace(/\(|\)/gi, ''),
      day: moment(pattern.untilDate, DATE_FORMAT).format(DATE_FORMAT2),
    }).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #5a: (1.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.dayString === 'ma-su' &&
    moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += translateText({
      id: 'route-pattern-select-from',
      range: translateText({
        id: `route-pattern-select-range-${pattern.dayString}`,
      }).replace(/\(|\)| /gi, ''),
      day: moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2),
    }).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }

  // Add opt #5b: (ma-pe 1.1. lähtien) or (la-su 31.1. lähtien)
  if (
    pattern.fromDate !== '-' &&
    pattern.dayString !== 'ma-su' &&
    moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2) !==
      'Invalid date'
  ) {
    retValue += translateText({
      id: 'route-pattern-select-from',
      range: translateText({
        id: `route-pattern-select-range-${pattern.dayString}`,
      }).replace(/\(|\)/gi, ''),
      day: moment(pattern.fromDate, DATE_FORMAT).format(DATE_FORMAT2),
    }).replace(/\( {2}|\( |\(/gi, '(');
    return retValue;
  }
  return retValue;
}
