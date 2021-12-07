import moment from 'moment';

import { DATE_FORMAT } from '../constants';

export const prepareServiceDay = params => {
  return {
    ...params,
    date: moment().format(DATE_FORMAT),
  };
};

export const prepareDatesForStops = params => {
  return {
    ...params,
    startTime: moment().unix() - 60 * 5, // 5 mins in the past
    date: moment().format(DATE_FORMAT),
  };
};

export const prepareWeekDays = params => {
  const monday = moment().isoWeekday(1).format(DATE_FORMAT);
  const tuesday = moment().isoWeekday(2).format(DATE_FORMAT);
  const wednesday = moment().isoWeekday(3).format(DATE_FORMAT);
  const thursday = moment().isoWeekday(4).format(DATE_FORMAT);
  const friday = moment().isoWeekday(5).format(DATE_FORMAT);
  const saturday = moment().isoWeekday(6).format(DATE_FORMAT);
  const sunday = moment().isoWeekday(7).format(DATE_FORMAT);
  return {
    ...params,
    dates: [monday, tuesday, wednesday, thursday, friday, saturday, sunday],
  };
};
