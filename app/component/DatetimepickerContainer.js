import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import debounce from 'lodash/debounce';
import loadable from '@loadable/component';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const Datetimepicker = loadable(
  () => import('@digitransit-component/digitransit-component-datetimepicker'),
  { ssr: true },
);

function DatetimepickerContainer({ realtime, embedWhenClosed }, context) {
  const { router, match } = context;

  const setParams = debounce((time, arriveBy) => {
    replaceQueryParams(router, match, {
      time,
      arriveBy,
    });
  }, 10);

  const onTimeChange = (time, arriveBy) => {
    setParams(time, arriveBy ? 'true' : undefined);
    addAnalyticsEvent({
      action: 'EditJourneyTime',
      category: 'ItinerarySettings',
      name: null,
    });
  };

  const onDateChange = (time, arriveBy) => {
    setParams(time, arriveBy ? 'true' : undefined);
    addAnalyticsEvent({
      action: 'EditJourneyDate',
      category: 'ItinerarySettings',
      name: null,
    });
  };

  const onNowClick = () => {
    setParams(undefined, undefined);
  };

  const onDepartureClick = time => {
    setParams(time, undefined);
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectLeaving',
    });
  };

  const onArrivalClick = time => {
    setParams(time, 'true');
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectArriving',
    });
  };

  return (
    <Datetimepicker
      realtime={realtime}
      initialTimestamp={match.location.query.time}
      initialArriveBy={match.location.query.arriveBy === 'true'}
      onTimeChange={onTimeChange}
      onDateChange={onDateChange}
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
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default DatetimepickerContainer;
