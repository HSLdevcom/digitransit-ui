import moment from 'moment';
import { DATE_FORMAT } from '../constants';

const prepareRouteScheduleParams = (params, match) => {
  const { query } = match.location;

  const startOfWeek = moment().startOf('isoWeek');
  const serviceDay =
    query &&
    query.serviceDay &&
    moment(query.serviceDay, 'YYYYMMDD', true).isValid()
      ? moment(query.serviceDay)
      : moment();

  const dayArray = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
  ];
  let day = startOfWeek;

  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 7; i++) {
      dayArray[j][i] = day.format(DATE_FORMAT);
      day = day.clone().add(1, 'd');
    }
  }

  return {
    ...params,
    serviceDate: serviceDay.format(DATE_FORMAT),
    date: moment().format(DATE_FORMAT),
    wk1day1: dayArray[0][0],
    wk1day2: dayArray[0][1],
    wk1day3: dayArray[0][2],
    wk1day4: dayArray[0][3],
    wk1day5: dayArray[0][4],
    wk1day6: dayArray[0][5],
    wk1day7: dayArray[0][6],
    wk2day1: dayArray[1][0],
    wk2day2: dayArray[1][1],
    wk2day3: dayArray[1][2],
    wk2day4: dayArray[1][3],
    wk2day5: dayArray[1][4],
    wk2day6: dayArray[1][5],
    wk2day7: dayArray[1][6],
    wk3day1: dayArray[2][0],
    wk3day2: dayArray[2][1],
    wk3day3: dayArray[2][2],
    wk3day4: dayArray[2][3],
    wk3day5: dayArray[2][4],
    wk3day6: dayArray[2][5],
    wk3day7: dayArray[2][6],
    wk4day1: dayArray[3][0],
    wk4day2: dayArray[3][1],
    wk4day3: dayArray[3][2],
    wk4day4: dayArray[3][3],
    wk4day5: dayArray[3][4],
    wk4day6: dayArray[3][5],
    wk4day7: dayArray[3][6],
    wk5day1: dayArray[4][0],
    wk5day2: dayArray[4][1],
    wk5day3: dayArray[4][2],
    wk5day4: dayArray[4][3],
    wk5day5: dayArray[4][4],
    wk5day6: dayArray[4][5],
    wk5day7: dayArray[4][6],
  };
};

export default prepareRouteScheduleParams;
