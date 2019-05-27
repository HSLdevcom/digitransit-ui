import cx from 'classnames';
import get from 'lodash/get';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';

import Departure from './Departure';
import { RouteAlertsQuery } from '../util/alertQueries';
import {
  getActiveAlertSeverityLevel,
  patternIdPredicate,
} from '../util/alertUtils';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES } from '../util/path';

const asDepartures = stoptimes =>
  !stoptimes
    ? []
    : stoptimes.map(stoptime => {
        const isArrival = stoptime.pickupType === 'NONE';
        let isLastStop = false;
        if (stoptime.trip && stoptime.trip.stops) {
          const lastStop = stoptime.trip.stops.slice(-1).pop();
          isLastStop = stoptime.stop.id === lastStop.id;
        }
        /* OTP returns either scheduled time or realtime prediction in
           * 'realtimeDeparture' and 'realtimeArrival' fields.
           * EXCEPT when state is CANCELLED, then it returns -1 for realtime  */
        const canceled = stoptime.realtimeState === 'CANCELED';
        const arrivalTime =
          stoptime.serviceDay +
          (!canceled ? stoptime.realtimeArrival : stoptime.scheduledArrival);
        const departureTime =
          stoptime.serviceDay +
          (!canceled
            ? stoptime.realtimeDeparture
            : stoptime.scheduledDeparture);
        const stoptimeTime = isArrival ? arrivalTime : departureTime;

        const { pattern } = stoptime.trip;
        return {
          alerts: get(pattern, 'route.alerts', []).filter(alert =>
            patternIdPredicate(alert, get(pattern, 'code', undefined)),
          ),
          canceled,
          isArrival,
          isLastStop,
          stoptime: stoptimeTime,
          stop: stoptime.stop,
          realtime: stoptime.realtime,
          pattern,
          headsign: stoptime.stopHeadsign,
          trip: stoptime.trip,
          pickupType: stoptime.pickupType,
        };
      });

class DepartureListContainer extends Component {
  static propTypes = {
    rowClasses: PropTypes.string.isRequired,
    stoptimes: PropTypes.array.isRequired,
    currentTime: PropTypes.number.isRequired,
    limit: PropTypes.number,
    infiniteScroll: PropTypes.bool,
    showStops: PropTypes.bool,
    routeLinks: PropTypes.bool,
    className: PropTypes.string,
    isTerminal: PropTypes.bool,
    showPlatformCodes: PropTypes.bool,
  };

  static defaultProps = {
    showPlatformCodes: false,
  };

  onScroll = () => {
    if (this.props.infiniteScroll && isBrowser) {
      return this.scrollHandler;
    }
    return null;
  };

  render() {
    const departureObjs = [];
    const { currentTime, limit, isTerminal, stoptimes } = this.props;

    let currentDate = moment
      .unix(currentTime)
      .startOf('day')
      .unix();
    let tomorrow = moment
      .unix(currentTime)
      .add(1, 'day')
      .startOf('day')
      .unix();

    const departures = asDepartures(stoptimes)
      .filter(departure => !(isTerminal && departure.isArrival))
      .filter(departure => currentTime < departure.stoptime)
      .slice(0, limit);

    departures.forEach(departure => {
      if (departure.stoptime >= tomorrow) {
        departureObjs.push(
          <div
            key={moment.unix(departure.stoptime).format('DDMMYYYY')}
            className="date-row border-bottom"
          >
            {moment.unix(departure.stoptime).format('dddd D.M.YYYY')}
          </div>,
        );

        currentDate = tomorrow;
        tomorrow = moment
          .unix(currentDate)
          .add(1, 'day')
          .startOf('day')
          .unix();
      }

      const id = `${departure.pattern.code}:${departure.stoptime}`;

      const alertSeverityLevel = getActiveAlertSeverityLevel(
        departure.alerts,
        currentTime,
      );
      const departureObj = (
        <Departure
          alertSeverityLevel={alertSeverityLevel}
          key={id}
          departure={departure}
          showStop={this.props.showStops}
          currentTime={currentTime}
          className={cx(
            { disruption: !!alertSeverityLevel },
            this.props.rowClasses,
          )}
          canceled={departure.canceled}
          isArrival={departure.isArrival}
          isLastStop={departure.isLastStop}
          showPlatformCode={this.props.showPlatformCodes}
        />
      );

      if (this.props.routeLinks) {
        departureObjs.push(
          <Link
            to={`/${PREFIX_ROUTES}/${departure.pattern.route.gtfsId}/pysakit/${
              departure.pattern.code
            }`}
            key={id}
          >
            {departureObj}
          </Link>,
        );
      } else {
        departureObjs.push(departureObj);
      }
    });

    return (
      <div
        className={cx('departure-list', this.props.className)}
        onScroll={this.onScroll()}
      >
        {departureObjs}
      </div>
    );
  }
}

const containerComponent = Relay.createContainer(DepartureListContainer, {
  fragments: {
    stoptimes: () => Relay.QL`
      fragment on Stoptime @relay(plural:true) {
          realtimeState
          realtimeDeparture
          scheduledDeparture
          realtimeArrival
          scheduledArrival
          realtime
          serviceDay
          pickupType
          stopHeadsign
          stop {
            id
            code
            platformCode
          }
          trip {
            gtfsId
            tripHeadsign
            stops {
              id
            }
            pattern {
              route {
                gtfsId
                shortName
                longName
                mode
                color
                agency {
                  name
                }
                ${RouteAlertsQuery}
              }
              code
            }
          }
        }
    `,
  },
});

export {
  containerComponent as default,
  DepartureListContainer as Component,
  asDepartures,
};
