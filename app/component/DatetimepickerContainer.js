import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import debounce from 'lodash/debounce';
import { connectToStores } from 'fluxible-addons-react';
import Datetimepicker from '@digitransit-component/digitransit-component-datetimepicker';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function DatetimepickerContainer(
  { realtime, embedWhenClosed, embedWhenOpen, lang, color },
  context,
) {
  const { router, match, config } = context;
  const openPicker = !!match.location.query.setTime; // string to boolean

  const setParams = debounce((time, arriveBy, setTime) => {
    replaceQueryParams(router, match, {
      time,
      arriveBy,
      setTime,
    });
  }, 10);

  const setOpenParam = debounce(setTime => {
    replaceQueryParams(router, match, {
      setTime,
    });
  }, 10);

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
      embedWhenOpen={embedWhenOpen}
      lang={lang}
      color={color}
      timeZone={config.timezoneData.split('|')[0]}
      serviceTimeRange={context.config.itinerary.serviceTimeRange}
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
  lang: PropTypes.string,
  color: PropTypes.string,
};

DatetimepickerContainer.defaultProps = {
  embedWhenClosed: null,
  embedWhenOpen: null,
  lang: 'en',
  color: '#007ac9',
};

DatetimepickerContainer.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
};

const withLang = connectToStores(
  DatetimepickerContainer,
  ['PreferencesStore'],
  context => ({
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { withLang as default, DatetimepickerContainer as Component };
