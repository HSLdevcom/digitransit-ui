import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import filter from 'lodash/filter';
import moment from 'moment';
import { Link } from 'react-router';
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Departure from './Departure';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES } from '../util/path';

const hasActiveDisruption = (t, alerts) =>
  filter(
    alerts,
    alert => alert.effectiveStartDate < t && t < alert.effectiveEndDate,
  ).length > 0;

const asDepartures = stoptimes =>
  !stoptimes
    ? []
    : stoptimes.map(stoptime => {
        const isArrival = stoptime.pickupType === 'NONE';
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

        return {
          canceled,
          isArrival,
          stoptime: stoptimeTime,
          stop: stoptime.stop,
          realtime: stoptime.realtime,
          pattern: stoptime.trip.pattern,
          headsign: stoptime.stopHeadsign,
          trip: stoptime.trip,
          pickupType: stoptime.pickupType,
        };
      });

class DepartureListContainer extends Component {
  static propTypes = {
    rowClasses: PropTypes.string.isRequired,
    stoptimes: PropTypes.array.isRequired,
    currentTime: PropTypes.object.isRequired,
    limit: PropTypes.number,
    infiniteScroll: PropTypes.bool,
    showStops: PropTypes.bool,
    routeLinks: PropTypes.bool,
    className: PropTypes.string,
    isTerminal: PropTypes.bool,
    showPlatformCodes: PropTypes.bool,
    relay: PropTypes.shape({
      setVariables: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    showPlatformCodes: false,
  };

  componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime.unix();
    const nextUnix = currentTime.unix();

    if (currUnix !== nextUnix) {
      relay.setVariables({ startTime: nextUnix });
    }
  }

  onScroll = () => {
    if (this.props.infiniteScroll && isBrowser) {
      return this.scrollHandler;
    }
    return null;
  };

  render() {
    const departureObjs = [];
    const currentTime = this.props.currentTime.unix();
    let currentDate = moment
      .unix(currentTime)
      .startOf('day')
      .unix();
    let tomorrow = moment
      .unix(currentTime)
      .add(1, 'day')
      .startOf('day')
      .unix();

    const departures = asDepartures(this.props.stoptimes)
      .filter(departure => !(this.props.isTerminal && departure.isArrival))
      .filter(departure => currentTime < departure.stoptime)
      .slice(0, this.props.limit);

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

      const classes = {
        disruption: hasActiveDisruption(
          departure.stoptime,
          departure.pattern.route.alerts,
        ),
        canceled: departure.canceled,
      };

      const departureObj = (
        <Departure
          key={id}
          departure={departure}
          showStop={this.props.showStops}
          currentTime={currentTime}
          hasDisruption={classes.disruption}
          className={cx(classes, this.props.rowClasses)}
          canceled={departure.canceled}
          isArrival={departure.isArrival}
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

export default Relay.createContainer(
  connectToStores(DepartureListContainer, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime(),
  })),
  {
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
            code
            platformCode
          }
          trip {
            gtfsId
            pattern {
              route {
                gtfsId
                shortName
                longName
                mode
                color
                alerts {
                  id
                  effectiveStartDate
                  effectiveEndDate
                }
                agency {
                  name
                }
              }
              code
            }
          }
        }
    `,
    },
  },
);
