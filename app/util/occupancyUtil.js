import moment from 'moment';

export function mapStatus(status) {
  if (status === 'EMPTY') {
    return 'MANY_SEATS_AVAILABLE';
  }
  if (status === 'NOT_ACCEPTING_PASSENGERS') {
    return 'FULL';
  }
  return status;
}

export function isDepartureWithinTenMinutes(legStartTime) {
  return (
    moment(legStartTime).diff(moment(), 'minutes') <= 10 &&
    moment(legStartTime).diff(moment(), 'minutes') > -1
  );
}
