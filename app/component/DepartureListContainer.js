import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import filter from 'lodash/filter';
import moment from 'moment';
import { Link } from 'react-router';
import cx from 'classnames';
import Departure from './Departure';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES } from '../util/path';
import {
  stopRealTimeClient,
  startRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';

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

        return {
          canceled,
          isArrival,
          isLastStop,
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
    currentTime: PropTypes.number.isRequired,
    limit: PropTypes.number,
    infiniteScroll: PropTypes.bool,
    showStops: PropTypes.bool,
    routeLinks: PropTypes.bool,
    className: PropTypes.string,
    isTerminal: PropTypes.bool,
    showPlatformCodes: PropTypes.bool,
    isStopPage: PropTypes.bool,
  };

  static defaultProps = {
    showPlatformCodes: false,
  };

  constructor(props) {
    super(props);
    this.startClient = this.startClient.bind(this);
    this.updateClient = this.updateClient.bind(this);
    this.state = { routes: [] };
  }

  componentDidMount() {
    if (this.context.config.showAllBusses && this.props.isStopPage) {
      const departures = asDepartures(this.props.stoptimes)
        .filter(departure => !(this.props.isTerminal && departure.isArrival))
        .filter(departure => this.props.currentTime < departure.stoptime);
      this.startClient(departures);
    }
  }

  componentDidUpdate() {
    if (this.context.config.showAllBusses && this.props.isStopPage) {
      const departures = asDepartures(this.props.stoptimes)
        .filter(departure => !(this.props.isTerminal && departure.isArrival))
        .filter(departure => this.props.currentTime < departure.stoptime)
        .filter(departure => departure.realtime);

      const currentRoutes = departures.map(
        departure => departure.trip.pattern.route.gtfsId.split(':')[1],
      );
      // Update client if realtimevehicles have changed
      if (
        JSON.stringify(currentRoutes.sort()) !==
        JSON.stringify(this.state.routes)
      ) {
        this.updateClient(departures);
      }
    }
  }

  componentWillUnmount() {
    if (this.context.config.showAllBusses && this.props.isStopPage) {
      const { client } = this.context.getStore('RealTimeInformationStore');
      if (client) {
        this.context.executeAction(stopRealTimeClient, client);
      }
    }
  }

  startClient = departures => {
    const trips = departures
      .filter(departure => departure.realtime)
      .filter(
        departure =>
          departure.pattern.stops
            .map(stop => stop.code)
            .indexOf(departure.stop.code) >= 0,
      )
      .map(departure => ({
        route: departure.trip.pattern.route.gtfsId.split(':')[1],
        headsign: '+',
        gtfsId: departure.trip.pattern.route.gtfsId,
        mode: '+',
        tripId: departure.trip.gtfsId.split(':')[1],
      }));

    this.setState({ routes: trips.map(e => e.route).sort() });
    const { realTime } = this.context.config;
    const agency = this.context.config.feedIds[0];
    const source = realTime[agency];
    if (source && source.active) {
      this.context.executeAction(startRealTimeClient, {
        ...source,
        agency,
        options: trips,
      });
    }
  };

  updateClient = departures => {
    const { client, topics } = this.context.getStore(
      'RealTimeInformationStore',
    );
    if (client) {
      const trips = departures
        .filter(departure => departure.realtime)
        .filter(
          departure =>
            departure.pattern.stops
              .map(stop => stop.code)
              .indexOf(departure.stop.code) >= 0,
        )
        .map(departure => ({
          route: departure.trip.pattern.route.gtfsId.split(':')[1],
          headsign: '+',
          gtfsId: departure.trip.pattern.route.gtfsId,
          mode: '+',
          tripId: departure.trip.gtfsId.split(':')[1],
        }));

      this.setState({ routes: trips.map(e => e.route).sort() });
      const { realTime } = this.context.config;
      const agency = this.context.config.feedIds[0];
      const source = realTime[agency];
      if (source && source.active) {
        this.context.executeAction(changeRealTimeClientTopics, {
          ...source,
          agency,
          options: trips,
          client,
          oldTopics: topics,
        });
      }
    }
  };

  onScroll = () => {
    if (this.props.infiniteScroll && isBrowser) {
      return this.scrollHandler;
    }
    return null;
  };

  render() {
    const departureObjs = [];
    const { currentTime } = this.props;
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
        disruption: hasActiveDisruption(departure.stoptime, departure.alerts),
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

DepartureListContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default Relay.createContainer(DepartureListContainer, {
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
            alerts {
              effectiveStartDate
              effectiveEndDate
            }
            gtfsId
            directionId
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
              }
              code
              stops {
                gtfsId
                code
              }
            }
          }
        }
    `,
  },
});
