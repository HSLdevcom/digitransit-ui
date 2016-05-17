import React, { PropTypes } from 'react';
import TimeAction from '../../action/time-action';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { plan as examplePlan } from '../documentation/ExampleData';


function setEarlierSelectedTime(executeAction, plan) {
  const earliestArrivalTime = plan.itineraries.reduce((previous, current) => {
    const endTime = moment(current.endTime);

    if (previous == null) {
      return endTime;
    } else if (endTime.isBefore(previous)) {
      return endTime;
    }
    return previous;
  }, null);

  earliestArrivalTime.subtract(1, 'minutes');
  return () => executeAction(TimeAction.setArrivalTime, earliestArrivalTime);
}

function setLaterSelectedTime(executeAction, plan) {
  const latestDepartureTime = plan.itineraries.reduce((previous, current) => {
    const startTime = moment(current.startTime);

    if (previous == null) {
      return startTime;
    } else if (startTime.isAfter(previous)) {
      return startTime;
    }
    return previous;
  }, null);

  latestDepartureTime.add(1, 'minutes');
  return () => executeAction(TimeAction.setDepartureTime, latestDepartureTime);
}

const setSelectedTimeToNow = (executeAction) =>
  () => executeAction(TimeAction.setDepartureTime, moment());

export default function TimeNavigationButtons({ plan }, { executeAction }) {
  if (plan == null) { return null; }
  return (
    <div className="time-navigation-buttons">
      <button className="standalone-btn" onClick={setEarlierSelectedTime(executeAction, plan)}>
        <FormattedMessage id="earlier" defaultMessage="Earlier" />
      </button>
      <button className="standalone-btn" onClick={setSelectedTimeToNow(executeAction)}>
        <FormattedMessage id="now" defaultMessage="Now" />
      </button>
      <button className="standalone-btn" onClick={setLaterSelectedTime(executeAction, plan)}>
        <FormattedMessage id="later" defaultMessage="Later" />
      </button>
    </div>
  );
}

TimeNavigationButtons.propTypes = {
  plan: PropTypes.shape({
    itineraries: PropTypes.arrayOf(
      PropTypes.shape({
        endTime: PropTypes.number.isRequired,
        startTime: PropTypes.number.isRequired,
      }).isRequired
    ).isRequired,
  }).isRequired,
};

TimeNavigationButtons.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

TimeNavigationButtons.description = (
  <div>
    <p>
      Shows buttons for changing the itinerary search time to show previous or next deaprtures or
      reset the time.
    </p>
    <ComponentUsageExample>
      <TimeNavigationButtons plan={examplePlan} />
    </ComponentUsageExample>
  </div>);
