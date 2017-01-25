import React, { PropTypes } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { route } from '../action/ItinerarySearchActions';

import ComponentUsageExample from './ComponentUsageExample';
import { plan as examplePlan } from './ExampleData';
import ItineraryFeedback from './itinerary-feedback';
import Icon from './Icon';

// TODO: sptlit into container and view

export default class TimeNavigationButtons extends React.Component {
  static propTypes = {
    itineraries: PropTypes.arrayOf(
      PropTypes.shape({
        endTime: PropTypes.number.isRequired,
        startTime: PropTypes.number.isRequired,
      }).isRequired,
    ).isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    breakpoint: PropTypes.string,
    executeAction: React.PropTypes.func.isRequired,
    config: React.PropTypes.object.isRequired,
  };

  static displayName ='TimeNavigationButtons';

  static description = () =>
    <div>
      <p>
        Shows buttons for changing the itinerary search time to show previous or next deaprtures or
        reset the time.
      </p>
      <ComponentUsageExample>
        <TimeNavigationButtons itineraries={examplePlan.itineraries} />
      </ComponentUsageExample>
    </div>

  setEarlierSelectedTime() {
    const earliestArrivalTime = this.props.itineraries.reduce((previous, current) => {
      const endTime = moment(current.endTime);

      if (previous == null) {
        return endTime;
      } else if (endTime.isBefore(previous)) {
        return endTime;
      }
      return previous;
    }, null);

    earliestArrivalTime.subtract(1, 'minutes');

    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            time: earliestArrivalTime.unix(),
            arriveBy: true,
          },
        },
        router: this.context.router,
      },
    );
  }

  setLaterSelectedTime() {
    const latestDepartureTime = this.props.itineraries.reduce((previous, current) => {
      const startTime = moment(current.startTime);

      if (previous == null) {
        return startTime;
      } else if (startTime.isAfter(previous)) {
        return startTime;
      }
      return previous;
    }, null);


    latestDepartureTime.add(1, 'minutes');

    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            time: latestDepartureTime.unix(),
            arriveBy: false,
          },
        },
        router: this.context.router,
      },
    );
  }

  setSelectedTimeToNow() {
    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            time: moment().unix(),
            arriveBy: false,
          },
        },
        router: this.context.router,
      },
    );
  }

  render() {
    const config = this.context.config;

    if (!this.props.itineraries || !this.props.itineraries[0]) { return null; }
    const itineraryFeedback = config.itinerary.enableFeedback ? <ItineraryFeedback /> : null;
    const enableButtonArrows = config.itinerary.timeNavigation.enableButtonArrows;
    const leftArrow = enableButtonArrows ?
      <Icon img={'icon-icon_arrow-left'} className="cursor-pointer back" /> : null;
    const rightArrow = enableButtonArrows ?
      <Icon img={'icon-icon_arrow-right'} className="cursor-pointer back" /> : null;

    return (
      <div
        className={
          cx('time-navigation-buttons', { 'bp-large': this.context.breakpoint === 'large' })
        }
      >
        {itineraryFeedback}
        <button
          className="standalone-btn time-navigation-earlier-btn"
          onClick={() => this.setEarlierSelectedTime()}
        >
          {leftArrow}
          <FormattedMessage id="earlier" defaultMessage="Earlier" />
        </button>
        <button
          className="standalone-btn time-navigation-now-btn"
          onClick={() => this.setSelectedTimeToNow()}
        >
          <FormattedMessage id="now" defaultMessage="Now" />
        </button>
        <button
          className="standalone-btn time-navigation-later-btn"
          onClick={() => this.setLaterSelectedTime()}
        >
          <FormattedMessage id="later" defaultMessage="Later" />
          {rightArrow}
        </button>
      </div>
    );
  }
}
