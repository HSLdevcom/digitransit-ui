import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'found';
import debounce from 'lodash/debounce';
import Datetimepicker from '@digitransit-component/digitransit-component-datetimepicker';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { useConfigContext } from '../configurations/ConfigContext';

export default function DatetimepickerContainer({
  realtime,
  embedWhenClosed = null,
  embedWhenOpen = null,
}) {
  const config = useConfigContext();
  const { match, router } = useRouter();
  const openPicker = !!match.location.query.setTime; // string to boolean

  const setParams = useMemo(
    () =>
      debounce((time, arriveBy, setTime) => {
        replaceQueryParams(router, match, {
          time: time?.toString(),
          arriveBy,
          setTime,
        });
      }, 10),
    [router, match],
  );

  const setOpenParam = useMemo(
    () =>
      debounce(setTime => {
        replaceQueryParams(router, match, {
          setTime,
        });
      }, 10),
    [router, match],
  );

  useEffect(() => {
    return () => {
      setParams.cancel();
      setOpenParam.cancel();
    };
  }, [setParams, setOpenParam]);

  const onClose = () => {
    setOpenParam(undefined);
  };

  const onOpen = () => {
    setOpenParam('true');
  };

  const onTimeChange = (time, arriveBy, onSubmit = false) => {
    const keepPickerOpen = onSubmit === false ? 'true' : undefined;
    setParams(time, arriveBy ? 'true' : undefined, keepPickerOpen);
    addAnalyticsEvent({
      action: 'EditJourneyTime',
      category: 'ItinerarySettings',
      name: null,
    });
  };

  const onDateChange = (time, arriveBy) => {
    setParams(time, arriveBy ? 'true' : undefined, 'true');
    addAnalyticsEvent({
      action: 'EditJourneyDate',
      category: 'ItinerarySettings',
      name: null,
    });
  };

  const onNowClick = time => {
    if (realtime) {
      setParams(undefined, undefined, undefined);
    } else {
      // Lock the current time in url when clicked on itinerary page
      setParams(time, undefined, undefined);
    }
  };

  const onDepartureClick = time => {
    setParams(time, undefined, 'true');
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectLeaving',
    });
  };

  const onArrivalClick = time => {
    setParams(time, 'true', 'true');
    addAnalyticsEvent({
      event: 'sendMatomoEvent',
      category: 'ItinerarySettings',
      action: 'LeavingArrivingSelection',
      name: 'SelectArriving',
    });
  };

  const initialTime = match.location.query.time
    ? parseInt(match.location.query.time, 10)
    : undefined;

  return (
    <Datetimepicker
      realtime={realtime}
      initialTimestamp={initialTime}
      initialArriveBy={match.location.query.arriveBy === 'true'}
      onTimeChange={onTimeChange}
      onDateChange={onDateChange}
      onNowClick={onNowClick}
      onDepartureClick={onDepartureClick}
      onArrivalClick={onArrivalClick}
      embedWhenClosed={embedWhenClosed}
      embedWhenOpen={embedWhenOpen}
      lang={config.language}
      color={config.colors.primary}
      timeZone={config.timeZone}
      serviceTimeRange={config.itinerary.serviceTimeRange}
      fontWeights={config.fontWeights}
      onOpen={onOpen}
      onClose={onClose}
      openPicker={openPicker}
    />
  );
}

DatetimepickerContainer.propTypes = {
  realtime: PropTypes.bool.isRequired,
  embedWhenClosed: PropTypes.node,
  embedWhenOpen: PropTypes.node,
};
