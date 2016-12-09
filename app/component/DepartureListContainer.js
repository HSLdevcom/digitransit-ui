import React, { PropTypes, Component } from 'react';
import Relay from 'react-relay';
import filter from 'lodash/filter';
import get from 'lodash/get';
import moment from 'moment';
import { Link } from 'react-router';
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Departure from './Departure';
import { isBrowser } from '../util/browser';

const mergeDepartures = departures =>
  Array.prototype.concat.apply([], departures).sort((a, b) => a.stoptime - b.stoptime);

const asDepartures = stoptimes => (
  !stoptimes ? [] : stoptimes.map(pattern =>
    pattern.stoptimes.map((stoptime) => {
      const isArrival = stoptime.pickupType === 'NONE';
      /* OTP returns either scheduled time or realtime prediction in
       * 'realtimeDeparture' and 'realtimeArrival' fields.
       * EXCEPT when state is CANCELLED, then it returns -1 for realtime  */
      const canceled = stoptime.realtimeState === 'CANCELED';
      const arrivalTime = stoptime.serviceDay +
        (!canceled
          ? stoptime.realtimeArrival
          : stoptime.scheduledArrival);
      const departureTime = stoptime.serviceDay +
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
        pattern: pattern.pattern,
        headsign: stoptime.stopHeadsign,
        trip: { gtfsId: stoptime.trip.gtfsId },
      };
    }),
  )
);

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
  };

  onScroll = () => {
    if (this.props.infiniteScroll && isBrowser) {
      return this.scrollHandler;
    }
    return null;
  };

  render() {
    const departureObjs = [];
    const currentTime = this.props.currentTime.unix();
    let currentDate = this.props.currentTime.clone()
      .startOf('day')
      .unix();
    let tomorrow = this.props.currentTime.clone()
      .add(1, 'day')
      .startOf('day')
      .unix();

    const departures = mergeDepartures(asDepartures(this.props.stoptimes))
      .filter(departure => !(this.props.isTerminal && departure.isArrival))
      .filter(departure => !(this.props.isTerminal && (departure.stoptime > currentTime + 3600)))
      .filter(departure => currentTime < departure.stoptime)
      .slice(0, this.props.limit);

    departures.forEach((departure) => {
      if (departure.stoptime >= tomorrow) {
        departureObjs.push(
          <div
            key={moment(departure.stoptime * 1000).format('DDMMYYYY')}
            className="date-row border-bottom"
          >
            {moment(departure.stoptime * 1000).format('dddd D.M.YYYY')}
          </div>);

        currentDate = tomorrow;
        tomorrow = moment.unix(currentDate)
          .add(1, 'day')
          .startOf('day')
          .unix();
      }

      const id = `${departure.pattern.code}:${departure.stoptime}`;

      const classes = {
        disruption:
          filter(
            departure.pattern.alerts,
            alert => (
              (alert.effectiveStartDate <= departure.stoptime) &&
              (departure.stoptime <= alert.effectiveEndDate) &&
              get(alert.trip.gtfsId) === get(departure.trip.gtfsId)
            ),
          ).length > 0,
        canceled: departure.canceled,
      };

      const departureObj = (
        <Departure
          key={id}
          departure={departure}
          showStop={this.props.showStops}
          currentTime={currentTime}
          className={cx(classes, this.props.rowClasses)}
          canceled={departure.canceled}
          isArrival={departure.isArrival}
          isTerminal={this.props.isTerminal}
        />
      );

      if (this.props.routeLinks) {
        departureObjs.push(
          <Link
            to={`/linjat/${departure.pattern.route.gtfsId}/pysakit/${departure.pattern.code}`}
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
      </div>);
  }
}

const DepartureListContainerWithTime = connectToStores(DepartureListContainer, ['TimeStore'],
  context => ({ currentTime: context.getStore('TimeStore').getCurrentTime() }),
);

export default Relay.createContainer(DepartureListContainerWithTime, {
  fragments: {
    stoptimes: () => Relay.QL`
      fragment on StoptimesInPattern @relay(plural:true) {
        pattern {
          alerts {
            effectiveStartDate
            effectiveEndDate
            trip {
              gtfsId
            }
          }
          route {
            gtfsId
            shortName
            longName
            mode
            color
          }
          code
        }
        stoptimes {
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
          }
        }
      }
    `,
  },
});
