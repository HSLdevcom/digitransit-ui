import moment from 'moment';

export const findLatestDeparture = itineraries =>
  (itineraries || []).reduce((previous, current) => {
    const startTime = moment(current.startTime);

    if (previous == null) {
      return startTime;
    }
    if (startTime.isAfter(previous)) {
      return startTime;
    }
    return previous;
  }, null);

export const findEarliestArrival = itineraries =>
  (itineraries || []).reduce((previous, current) => {
    const endTime = moment(current.endTime);
    if (previous == null) {
      return endTime;
    }
    if (endTime.isBefore(previous)) {
      return endTime;
    }
    return previous;
  }, null);
