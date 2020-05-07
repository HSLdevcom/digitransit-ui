import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import debounce from 'lodash/debounce';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import Datetimepicker from './Datetimepicker';

function getInitialTimestamp(match, realtime) {
  const now = realtime ? null : moment().valueOf();
  return match.location.query.time
    ? moment(Number(match.location.query.time) * 1000).valueOf()
    : now;
}

function getInitialDepartureOrArrival(match) {
  return match.location.query.arriveBy ? 'arrival' : 'departure';
}

function DatetimepickerContainer({ realtime }, context) {
  const { router, match } = context;

  const [timestamp, changeTimestamp] = useState(
    getInitialTimestamp(match, realtime),
  );
  const [departureOrArrival, changeDepartureOrArrival] = useState(
    getInitialDepartureOrArrival(match),
  );

  const setParams = debounce((newTime, newDepartureOrArrival) => {
    let time;
    if (newTime) {
      time = Math.round(newTime / 1000);
    }
    let arriveBy;
    if (newDepartureOrArrival === 'arrival') {
      arriveBy = true;
    }
    replaceQueryParams(router, match, {
      time,
      arriveBy,
    });
  }, 10);

  useEffect(() => setParams(timestamp, departureOrArrival), [
    timestamp,
    departureOrArrival,
  ]);

  const onTimeChange = newTime => {
    if (newTime === null) {
      return; // TODO
    }
    changeTimestamp(newTime);
    addAnalyticsEvent({
      action: 'EditJourneyTime',
      category: 'ItinerarySettings',
      name: null,
    });
  };

  const onDateChange = newDate => {
    if (newDate === null) {
      return; // TODO
    }
    changeTimestamp(newDate);
    addAnalyticsEvent({
      action: 'EditJourneyDate',
      category: 'ItinerarySettings',
      name: null,
    });
  };

  const setDepartureNow = () => {
    changeDepartureOrArrival('departure');
    if (realtime) {
      changeTimestamp(null);
    } else {
      changeTimestamp(moment().valueOf());
    }
  };

  const onDepartureClick = () => {
    if (timestamp === null) {
      changeTimestamp(moment().valueOf());
    }
    if (departureOrArrival === 'departure') {
      return;
    }
    changeDepartureOrArrival('departure');
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectLeaving',
    });
  };

  const onArrivalClick = () => {
    if (timestamp === null) {
      changeTimestamp(moment().valueOf());
    }
    if (departureOrArrival === 'arrival') {
      return;
    }
    changeDepartureOrArrival('arrival');
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectArriving',
    });
  };

  return (
    <Datetimepicker
      timestamp={timestamp}
      onTimeChange={onTimeChange}
      onDateChange={onDateChange}
      departureOrArrival={departureOrArrival}
      onNowClick={setDepartureNow}
      onDepartureClick={onDepartureClick}
      onArrivalClick={onArrivalClick}
    />
  );
}

DatetimepickerContainer.propTypes = {
  realtime: PropTypes.bool.isRequired,
};

DatetimepickerContainer.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DatetimepickerContainer;
