import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import debounce from 'lodash/debounce';
import { connectToStores } from 'fluxible-addons-react';
// TODO use this again once AB testing is done
// import Datetimepicker from '@digitransit-component/digitransit-component-datetimepicker';
import { MobileDatetimepickerTest } from '@digitransit-component/digitransit-component-abtesting';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function DatetimepickerContainer(
  { realtime, embedWhenClosed, lang, color },
  context,
) {
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

  const onNowClick = time => {
    if (realtime) {
      setParams(undefined, undefined);
    } else {
      // Lock the current time in url when clicked on itinerary page
      setParams(time, undefined);
    }
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
  const forceTestVariant = match.location.query.dtVariant;
  return (
    <MobileDatetimepickerTest
      forceVariant={forceTestVariant}
      realtime={realtime}
      initialTimestamp={match.location.query.time}
      initialArriveBy={match.location.query.arriveBy === 'true'}
      onTimeChange={onTimeChange}
      onDateChange={onDateChange}
      onNowClick={onNowClick}
      onDepartureClick={onDepartureClick}
      onArrivalClick={onArrivalClick}
      embedWhenClosed={embedWhenClosed}
      lang={lang}
      color={color}
      timeZone={context.config.timezoneData.split('|')[0]}
    />
  );
}

DatetimepickerContainer.propTypes = {
  realtime: PropTypes.bool.isRequired,
  embedWhenClosed: PropTypes.node,
  lang: PropTypes.string,
  color: PropTypes.string,
};

DatetimepickerContainer.defaultProps = {
  embedWhenClosed: null,
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
