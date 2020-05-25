import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';
import debounce from 'lodash/debounce';
import loadable from '@loadable/component';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const Datetimepicker = loadable(
  () => import('@digitransit-component/digitransit-component-datetimepicker'),
  { ssr: true },
);

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
  const setParams = debounce(params => {
    let time;
    let arriveBy;
    switch (params.timestamp) {
      case undefined:
        time = Math.round(timestamp / 1000);
        break;
      case null:
        time = undefined;
        break;
      default:
        time = Math.round(params.timestamp / 1000);
        break;
    }

    switch (params.departureOrArrival) {
      case undefined:
        arriveBy = departureOrArrival === 'arrival' ? true : undefined;
        break;
      case 'arrival':
        arriveBy = true;
        break;
      case 'departure':
        arriveBy = undefined;
        break;
      default:
        break;
    }

    replaceQueryParams(router, match, {
      time,
      arriveBy,
    });
  }, 10);

  const onTimestampChange = newTimestamp => {
    changeTimestampState(newTimestamp);
    setParams({ timestamp: newTimestamp });
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
    const newTimestamp = realtime ? null : moment().valueOf();
    changeTimestampState(newTimestamp);
    setParams({ departureOrArrival: 'departure', timestamp: newTimestamp });
  };

  const onDepartureClick = () => {
    const changes = {};
    if (timestamp === null) {
      const now = moment().valueOf();
      changeTimestampState(now);
      changes.timestamp = now;
    }
    if (departureOrArrival !== 'departure') {
      changeDepartureOrArrival('departure');
      addAnalyticsEvent({
        event: 'sendMatomoEvent',
        category: 'ItinerarySettings',
        action: 'LeavingArrivingSelection',
        name: 'SelectLeaving',
      });
      changes.departureOrArrival = 'departure';
    }
    if (changes.timestamp || changes.departureOrArrival) {
      setParams(changes);
    }
  };

  const onArrivalClick = () => {
    const changes = {};
    if (timestamp === null) {
      const now = moment().valueOf();
      changeTimestampState(now);
      changes.timestamp = now;
    }
    if (departureOrArrival !== 'arrival') {
      changeDepartureOrArrival('arrival');
      addAnalyticsEvent({
        event: 'sendMatomoEvent',
        category: 'ItinerarySettings',
        action: 'LeavingArrivingSelection',
        name: 'SelectArriving',
      });
      changes.departureOrArrival = 'arrival';
    }
    if (changes.timestamp || changes.departureOrArrival) {
      setParams(changes);
    }
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
