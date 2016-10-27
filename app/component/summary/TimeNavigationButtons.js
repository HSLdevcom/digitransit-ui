import React, { PropTypes } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { plan as examplePlan } from '../documentation/ExampleData';
import ItineraryFeedback from '../itinerary-feedback/itinerary-feedback';
import Icon from '../icon/Icon';
import config from '../../config';

function setEarlierSelectedTime(router, location, itineraries) {
  const earliestArrivalTime = itineraries.reduce((previous, current) => {
    const endTime = moment(current.endTime);

    if (previous == null) {
      return endTime;
    } else if (endTime.isBefore(previous)) {
      return endTime;
    }
    return previous;
  }, null);

  earliestArrivalTime.subtract(1, 'minutes');
  router.replace({
    ...location,
    query: { ...location.query, time: earliestArrivalTime.unix(), arriveBy: true },
  });
}

function setLaterSelectedTime(router, location, itineraries) {
  const latestDepartureTime = itineraries.reduce((previous, current) => {
    const startTime = moment(current.startTime);

    if (previous == null) {
      return startTime;
    } else if (startTime.isAfter(previous)) {
      return startTime;
    }
    return previous;
  }, null);

  latestDepartureTime.add(1, 'minutes');
  router.replace({
    ...location,
    query: { ...location.query, time: latestDepartureTime.unix(), arriveBy: false },
  });
}

const setSelectedTimeToNow = (router, location) =>
  router.replace({
    ...location,
    query: { ...location.query, time: moment().unix(), arriveBy: false },
  });


// TODO: sptlit into container and view
export default function TimeNavigationButtons({ itineraries }, { router, location, breakpoint }) {
  if (!itineraries || !itineraries[0]) { return null; }
  const itineraryFeedback = config.itinerary.enableFeedback ? <ItineraryFeedback /> : null;
  const enableButtonArrows = config.itinerary.timeNavigation.enableButtonArrows;
  const leftArrow = enableButtonArrows ?
    <Icon img={'icon-icon_arrow-left'} className="cursor-pointer back" /> : null;
  const rightArrow = enableButtonArrows ?
    <Icon img={'icon-icon_arrow-right'} className="cursor-pointer back" /> : null;

  return (
    <div className={cx('time-navigation-buttons', { 'bp-large': breakpoint === 'large' })}>
      {itineraryFeedback}
      <button
        className="standalone-btn time-navigation-earlier-btn"
        onClick={() => setEarlierSelectedTime(router, location, itineraries)}
      >
        {leftArrow}
        <FormattedMessage id="earlier" defaultMessage="Earlier" />
      </button>
      <button
        className="standalone-btn time-navigation-now-btn"
        onClick={() => setSelectedTimeToNow(router, location)}
      >
        <FormattedMessage id="now" defaultMessage="Now" />
      </button>
      <button
        className="standalone-btn time-navigation-later-btn"
        onClick={() => setLaterSelectedTime(router, location, itineraries)}
      >
        <FormattedMessage id="later" defaultMessage="Later" />
        {rightArrow}
      </button>
    </div>
  );
}

TimeNavigationButtons.propTypes = {
  itineraries: PropTypes.arrayOf(
    PropTypes.shape({
      endTime: PropTypes.number.isRequired,
      startTime: PropTypes.number.isRequired,
    }).isRequired
  ).isRequired,
};

TimeNavigationButtons.contextTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  breakpoint: PropTypes.string,
};

TimeNavigationButtons.description = (
  <div>
    <p>
      Shows buttons for changing the itinerary search time to show previous or next deaprtures or
      reset the time.
    </p>
    <ComponentUsageExample>
      <TimeNavigationButtons itineraries={examplePlan.itineraries} />
    </ComponentUsageExample>
  </div>);
