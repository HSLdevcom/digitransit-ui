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
