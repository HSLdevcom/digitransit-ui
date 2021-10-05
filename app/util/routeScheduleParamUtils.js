import moment from 'moment';
import { DATE_FORMAT } from '../constants';

const populateData = (params, match, noOfWeeks) => {
  const { query } = match.location;

  const startOfWeek = moment().startOf('isoWeek');
  const date = moment(query.serviceDay, 'YYYYMMDD', true);
  const serviceDay =
    query &&
    query.serviceDay &&
    date.isValid() &&
    !moment(date.clone().startOf('isoWeek').format(DATE_FORMAT)).isBefore(
      moment(moment().startOf('isoWeek').format(DATE_FORMAT)),
    )
      ? moment(query.serviceDay)
      : moment();

  let day = startOfWeek;

  const weeks = {};
  for (let j = 0; j < noOfWeeks; j++) {
    for (let i = 0; i < 7; i++) {
      weeks[`wk${j + 1}day${i + 1}`] = day.format(DATE_FORMAT);
      day = day.clone().add(1, 'd');
    }
  }

  return {
    ...params,
    serviceDate: serviceDay.format(DATE_FORMAT),
    date: moment().format(DATE_FORMAT),
    showTenWeeks: noOfWeeks === 10,
    ...weeks,
  };
};

export const prepareRouteScheduleParamsWithFiveWeeks = (params, match) => {
  return populateData(params, match, 5);
};

export const prepareRouteScheduleParamsWithTenWeeks = (params, match) => {
  return populateData(params, match, 10);
};
