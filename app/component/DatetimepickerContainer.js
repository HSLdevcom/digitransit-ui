import PropTypes from 'prop-types';
import React, { useState } from 'react';
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

function DatetimepickerContainer({ realtime, embedWhenClosed }, context) {
  const { router, match } = context;

  const [timestamp, changeTimestampState] = useState(
    getInitialTimestamp(match, realtime),
  );
  const [departureOrArrival, changeDepartureOrArrival] = useState(
    getInitialDepartureOrArrival(match),
  );

  // change url query param time
  const setTimeParam = debounce(newTime => {
    let time;
    if (newTime) {
      time = Math.round(newTime / 1000);
    }
    const oldTime = match.location.query.time;
    // TODO does changed work?
    const changed =
      (!oldTime && newTime) ||
      (oldTime && !moment(newTime).isSame(moment(oldTime * 1000), 'minute'));
    if (!changed) {
      return;
    }
    replaceQueryParams(router, match, {
      time,
    });
  }, 10);

  // change url query param arriveBy
  const setDepartureOrArrivalParam = debounce(newValue => {
    let arriveBy;
    if (newValue === 'arrival') {
      arriveBy = true;
    }
    if (match.location.query.arriveBy === arriveBy) {
      return;
    }
    replaceQueryParams(router, match, {
      arriveBy,
    });
  }, 10);

  const onTimestampChange = newTimestamp => {
    changeTimestampState(newTimestamp);
    setTimeParam(newTimestamp);
  };

  const onTimeChange = debounce(newTime => {
    if (newTime === null) {
      onTimestampChange(moment().valueOf());
      return;
    }
    onTimestampChange(newTime);
    addAnalyticsEvent({
      action: 'EditJourneyTime',
      category: 'ItinerarySettings',
      name: null,
    });
  }, 10);

  const onDateChange = debounce(newDate => {
    if (newDate === null) {
      onTimestampChange(moment().valueOf());
      return;
    }
    onTimestampChange(newDate);
    addAnalyticsEvent({
      action: 'EditJourneyDate',
      category: 'ItinerarySettings',
      name: null,
    });
  }, 10);

  const onNowClick = () => {
    changeDepartureOrArrival('departure');
    setDepartureOrArrivalParam('departure');
    if (realtime) {
      onTimestampChange(null);
    } else {
      onTimestampChange(moment().valueOf());
    }
  };

  const onDepartureClick = () => {
    if (timestamp === null) {
      onTimestampChange(moment().valueOf());
    }
    if (departureOrArrival === 'departure') {
      return;
    }
    changeDepartureOrArrival('departure');
    setDepartureOrArrivalParam('departure');
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectLeaving',
    });
  };

  const onArrivalClick = () => {
    if (timestamp === null) {
      onTimestampChange(moment().valueOf());
    }
    if (departureOrArrival === 'arrival') {
      return;
    }
    changeDepartureOrArrival('arrival');
    setDepartureOrArrivalParam('arrival');
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
      onNowClick={onNowClick}
      onDepartureClick={onDepartureClick}
      onArrivalClick={onArrivalClick}
      embedWhenClosed={embedWhenClosed}
    />
  );
}

DatetimepickerContainer.propTypes = {
  realtime: PropTypes.bool.isRequired,
  embedWhenClosed: PropTypes.node,
};

DatetimepickerContainer.defaultProps = {
  embedWhenClosed: null,
};

DatetimepickerContainer.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DatetimepickerContainer;
