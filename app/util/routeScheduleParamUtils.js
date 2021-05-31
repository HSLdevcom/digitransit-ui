import moment from 'moment';
import { DATE_FORMAT } from '../constants';

const prepareRouteScheduleParams = (params, match) => {
  const { query } = match.location;

  const showAdditionalWeeks = params && params.routeId.includes('tampere');

  const startOfWeek = moment().startOf('isoWeek');
  const date = moment(query.serviceDay, 'YYYYMMDD', true);
  const serviceDay =
    query && query.serviceDay && date.isValid() && date.isAfter(moment())
      ? moment(query.serviceDay)
      : moment();

  let day = startOfWeek;

  const weeksToShow = showAdditionalWeeks ? 10 : 5;
  const weeks = {};
  for (let j = 0; j < weeksToShow; j++) {
    for (let i = 0; i < 7; i++) {
      weeks[`wk${j + 1}day${i + 1}`] = day.format(DATE_FORMAT);
      day = day.clone().add(1, 'd');
    }
  }

  return {
    ...params,
    serviceDate: serviceDay.format(DATE_FORMAT),
    date: moment().format(DATE_FORMAT),
    showAdditionalWeeks,
    ...weeks,
  };
};

export default prepareRouteScheduleParams;
