import cx from 'classnames';
import get from 'lodash/get';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import DepartureRow from './DepartureRow';
import { patternIdPredicate } from '../util/alertUtils';
import { isBrowser } from '../util/browser';
import {
  stopRealTimeClient,
  startRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import { getHeadsignFromRouteLongName } from '../util/legUtils';

const asDepartures = stoptimes =>
  !stoptimes
    ? []
    : stoptimes
        // it seems that OTP2 GTFS-RT handling sometimes adds weird zero stop trips, we filter them out
        .filter(s => s.trip.stops.length > 0)
        .map(stoptime => {
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
            headsign: stoptime.headsign,
            trip: stoptime.trip,
            pickupType: stoptime.pickupType,
            serviceDay: stoptime.serviceDay,
          };
        });

class DepartureListContainer extends Component {
  static propTypes = {
    stoptimes: PropTypes.array.isRequired,
    mode: PropTypes.string.isRequired,
    currentTime: PropTypes.number.isRequired,
    limit: PropTypes.number,
    infiniteScroll: PropTypes.bool,
    routeLinks: PropTypes.bool,
    className: PropTypes.string,
    isTerminal: PropTypes.bool,
    isStopPage: PropTypes.bool,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.pageLoadedAlertRef = React.createRef();
  }

  componentDidMount() {
    if (this.pageLoadedAlertRef.current) {
      this.pageLoadedAlertRef.current.innerHTML = this.context.intl.formatMessage(
        {
          id: 'stop-page.right-now.loaded',
          defaultMessage: 'Right now stop page loaded',
        },
      );
      setTimeout(() => {
        this.pageLoadedAlertRef.current.innerHTML = null;
      }, 100);
    }
    if (this.context.config.showVehiclesOnStopPage && this.props.isStopPage) {
      const departures = asDepartures(this.props.stoptimes)
        .filter(departure => !(this.props.isTerminal && departure.isArrival))
        .filter(departure => this.props.currentTime < departure.stoptime);
      this.startClient(departures);
    }
  }

  componentDidUpdate() {
    if (this.context.config.showVehiclesOnStopPage && this.props.isStopPage) {
      const departures = asDepartures(this.props.stoptimes)
        .filter(departure => !(this.props.isTerminal && departure.isArrival))
        .filter(departure => this.props.currentTime < departure.stoptime)
        .filter(departure => departure.realtime);

      this.updateClient(departures);
    }
  }

  componentWillUnmount() {
    if (this.context.config.showVehiclesOnStopPage && this.props.isStopPage) {
      const { client } = this.context.getStore('RealTimeInformationStore');
      if (client) {
        this.context.executeAction(stopRealTimeClient, client);
      }
    }
  }

  configClient = departures => {
    const trips = departures
      .filter(departure => departure.realtime)
      .filter(
        departure =>
          departure.pattern.stops
            .map(stop => stop.code)
            .indexOf(departure.stop.code) >= 0,
      )
      .map(departure => ({
        tripId: departure.trip.gtfsId.split(':')[1],
      }));

    const { config } = this.context;
    const { realTime } = config;
    let agency;

    /* handle multiple feedid case */
    config.feedIds.forEach(ag => {
      if (!agency && realTime[ag]) {
        agency = ag;
      }
    });
    const source = agency && realTime[agency];
    if (source && source.active) {
      return {
        ...source,
        agency,
        options: trips,
      };
    }
    return null;
  };

  startClient = departures => {
    const clientConfig = this.configClient(departures);
    if (clientConfig) {
      this.context.executeAction(startRealTimeClient, clientConfig);
    }
  };

  updateClient = departures => {
    const { client, topics } = this.context.getStore(
      'RealTimeInformationStore',
    );
    if (client) {
      const clientConfig = this.configClient(departures);
      if (clientConfig) {
        this.context.executeAction(changeRealTimeClientTopics, {
          ...clientConfig,
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

  getHeadsign = departure => {
    if (departure.isArrival) {
      if (departure.isLastStop) {
        return this.context.intl.formatMessage({
          id: 'route-destination-endpoint',
          defaultMessage: 'Arrives / Terminus',
        });
      }
      return (
        departure.trip?.tripHeadsign ||
        this.context.intl.formatMessage({
          id: 'route-destination-arrives',
          defaultMessage: 'Drop-off only',
        })
      );
    }
    const headsign =
      departure.headsign ||
      departure.pattern.headsign ||
      (departure.trip && departure.trip.tripHeadsign) ||
      getHeadsignFromRouteLongName(departure.pattern.route);

    if (headsign.endsWith(' via')) {
      return headsign.substring(0, headsign.indexOf(' via'));
    }
    return headsign;
  };

  render() {
    const screenReaderAlert = (
      <span className="sr-only" role="alert" ref={this.pageLoadedAlertRef} />
    );

    const departureObjs = [];
    const { currentTime, limit, isTerminal, stoptimes } = this.props;

    let serviceDayCutoff = moment.unix(currentTime).startOf('day').unix();
    let dayCutoff = moment.unix(currentTime).startOf('day').unix();
    const departures = asDepartures(stoptimes)
      .filter(departure => !(isTerminal && departure.isArrival))
      .filter(departure => currentTime < departure.stoptime)
      .slice(0, limit);

    // Add day dividers when day changes and add service day divider after service day changes.
    // If day divider and service day dividers are added with same departure only show day divider.
    const departuresWithDayDividers = departures.map(departure => {
      const serviceDate = moment.unix(departure.serviceDay).format('DDMMYYYY');
      const dayCutoffDate = moment.unix(dayCutoff).format('DDMMYYYY');
      const stoptimeDate = moment.unix(departure.stoptime).format('DDMMYYYY');
      const serviceDayCutoffDate = moment
        .unix(serviceDayCutoff)
        .format('DDMMYYYY');

      if (stoptimeDate !== dayCutoffDate && departure.stoptime > dayCutoff) {
        dayCutoff = moment.unix(departure.stoptime).startOf('day').unix();
        // eslint-disable-next-line no-param-reassign
        departure.addDayDivider = true;
      }

      if (
        serviceDate !== serviceDayCutoffDate &&
        departure.serviceDay > serviceDayCutoff
      ) {
        // eslint-disable-next-line no-param-reassign
        departure.addServiceDayDivider = true;
        const daysAdd = serviceDate === serviceDayCutoffDate ? 1 : 0;
        serviceDayCutoff = moment
          .unix(departure.serviceDay)
          .startOf('day')
          .add(daysAdd, 'day')
          .unix();
      }
      return departure;
    });

    let firstDayDepartureCount = 0;
    departuresWithDayDividers.forEach((departure, index) => {
      const departureDate = moment.unix(departure.stoptime).format('DDMMYYYY');
      const nextDay = moment.unix(currentTime).add(1, 'day').unix();
      if (departure.stoptime < nextDay) {
        firstDayDepartureCount += 1;
      }

      // If next 24h has more than 10 departures only show stops for the next 24h
      if (departure.stoptime > nextDay && firstDayDepartureCount >= 10) {
        return;
      }

      if (departure.addDayDivider) {
        departureObjs.push(
          <div key={departureDate} className="date-row border-bottom">
            {moment.unix(departure.stoptime).format('dddd D.M.YYYY')}
          </div>,
        );
      } else if (departure.addServiceDayDivider) {
        departureObjs.push(<div className="departure-day-divider" />);
      }

      const id = `${departure.pattern.code}:${departure.stoptime}`;
      const row = {
        headsign: this.getHeadsign(departure),
        trip: { ...departure.trip, ...{ route: departure.trip.pattern.route } },
        stop: departure.stop,
        realtime: departure.realtime,
        bottomRow:
          departure.isArrival && !departure.isLastStop ? (
            <div className="drop-off-container">
              <Icon
                img="icon-icon_info"
                color={this.context.config.colors.primary}
              />
              <FormattedMessage
                id="route-destination-arrives"
                defaultMessage="Drop-off only"
              />
            </div>
          ) : null,
      };

      const nextDeparture = departuresWithDayDividers[index + 1];

      const departureObj = (
        <DepartureRow
          key={id}
          departure={row}
          showLink={this.props.routeLinks}
          departureTime={departure.stoptime}
          currentTime={this.props.currentTime}
          showPlatformCode={isTerminal}
          canceled={departure.canceled}
          className={
            nextDeparture &&
            nextDeparture.addServiceDayDivider &&
            !nextDeparture.addDayDivider
              ? 'no-border'
              : ''
          }
        />
      );

      departureObjs.push(departureObj);
    });

    return (
      <>
        {screenReaderAlert}
        <span className="sr-only">
          <FormattedMessage
            id="departure-list-update.sr-instructions"
            default="The departure list and estimated departure times will update in real time."
          />
        </span>
        <table
          className={cx('departure-list', this.props.className)}
          onScroll={this.onScroll()}
        >
          <thead className="sr-only">
            <tr>
              <th>
                <FormattedMessage id="route" defaultMessage="Route" />
              </th>
              <th>
                <FormattedMessage
                  id="destination"
                  defaultMessage="Destination"
                />
              </th>
              <th>
                <FormattedMessage id="leaving-at" defaultMessage="Leaves" />
              </th>
              <th>
                <FormattedMessage
                  id={this.props.mode === 'BUS' ? 'platform' : 'track'}
                  defaultMessage={
                    this.props.mode === 'BUS' ? 'Platform' : 'Track'
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody>{departureObjs}</tbody>
        </table>
      </>
    );
  }
}

DepartureListContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

const containerComponent = createFragmentContainer(DepartureListContainer, {
  stoptimes: graphql`
    fragment DepartureListContainer_stoptimes on Stoptime @relay(plural: true) {
      realtimeState
      realtimeDeparture
      scheduledDeparture
      realtimeArrival
      scheduledArrival
      realtime
      serviceDay
      pickupType
      headsign
      stop {
        id
        code
        platformCode
      }
      trip {
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
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
              trip {
                pattern {
                  code
                }
              }
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
});

export {
  containerComponent as default,
  DepartureListContainer as Component,
  asDepartures,
};
