import { DateTime } from 'luxon';
import { DATE_FORMAT } from '../constants';

const populateData = (params, match, noOfWeeks) => {
  const { query } = match.location;

  const startOfWeek = DateTime.now().startOf('week');
  const date = query.serviceDay
    ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
    : null;
  const serviceDay =
    date && date.isValid && date.startOf('week') >= startOfWeek
      ? DateTime.fromFormat(query.serviceDay, DATE_FORMAT)
      : DateTime.now();

  let day = startOfWeek;

  const weeks = {};
  for (let j = 0; j < noOfWeeks; j++) {
    for (let i = 0; i < 7; i++) {
      weeks[`wk${j + 1}day${i + 1}`] = day.toFormat(DATE_FORMAT);
      day = day.plus({ days: 1 });
    }
  }

  return {
    ...params,
    serviceDate: serviceDay.toFormat(DATE_FORMAT),
    date: DateTime.now().toFormat(DATE_FORMAT),
    showTenWeeks: noOfWeeks === 10,
    ...weeks,
  };
};

export function prepareScheduleParamsWithFiveWeeks(params, match) {
  return populateData(params, match, 5);
}

export function prepareScheduleParamsWithTenWeeks(params, match) {
  return populateData(params, match, 10);
}
