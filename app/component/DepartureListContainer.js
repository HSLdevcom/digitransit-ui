import cx from 'classnames';
import get from 'lodash/get';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Link from 'found/Link';
import { intlShape, FormattedMessage } from 'react-intl';

import DepartureRow from './DepartureRow';
import { patternIdPredicate } from '../util/alertUtils';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import {
  stopRealTimeClient,
  startRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import { addAnalyticsEvent } from '../util/analyticsUtils';

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
          headsign: stoptime.headsign,
          trip: stoptime.trip,
          pickupType: stoptime.pickupType,
        };
      });

class DepartureListContainer extends Component {
  static propTypes = {
    stoptimes: PropTypes.array.isRequired,
    currentTime: PropTypes.number.isRequired,
    limit: PropTypes.number,
    infiniteScroll: PropTypes.bool,
    routeLinks: PropTypes.bool,
    className: PropTypes.string,
    isTerminal: PropTypes.bool,
    isStopPage: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.startClient = this.startClient.bind(this);
    this.updateClient = this.updateClient.bind(this);
    this.pageLoadedAlertRef = React.createRef();
  }

  componentDidMount() {
    if (this.pageLoadedAlertRef.current) {
      // eslint-disable-next-line no-self-assign
      this.pageLoadedAlertRef.current.innerHTML = this.pageLoadedAlertRef.current.innerHTML;
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
      return this.context.intl.formatMessage({
        id: 'route-destination-arrives',
        defaultMessage: 'Drop-off only',
      });
    }
    let headsign =
      departure.headsign ||
      departure.pattern.headsign ||
      (departure.trip && departure.trip.tripHeadsign);

    if (!headsign) {
      const { longName, shortName } = departure.pattern.route;
      headsign = longName;
      if (
        longName.substring(0, shortName.length) === shortName &&
        longName.length > shortName.length
      ) {
        headsign = longName.substring(shortName.length);
      }
    }

    return headsign;
  };

  render() {
    const screenReaderAlert = (
      <span className="sr-only" role="alert" ref={this.pageLoadedAlertRef}>
        <FormattedMessage
          id="stop-page.right-now.loaded"
          defaultMessage="Right now stop page loaded"
        />
      </span>
    );

    const departureObjs = [];
    const { currentTime, limit, isTerminal, stoptimes } = this.props;

    let currentDate = moment.unix(currentTime).startOf('day').unix();
    let tomorrow = moment.unix(currentTime).add(1, 'day').startOf('day').unix();

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
        tomorrow = moment.unix(currentDate).add(1, 'day').startOf('day').unix();
      }
      const id = `${departure.pattern.code}:${departure.stoptime}`;
      const row = {
        headsign: this.getHeadsign(departure),
        trip: { ...departure.trip, ...{ route: departure.trip.pattern.route } },
        stop: departure.stop,
        realtime: departure.realtime,
      };

      const departureObj = (
        <DepartureRow
          key={id}
          departure={row}
          departureTime={departure.stoptime}
          currentTime={this.props.currentTime}
          showPlatformCode={isTerminal}
          canceled={departure.canceled}
        />
      );

      // DT-3331: added query string sort=no to Link's to
      if (this.props.routeLinks) {
        departureObjs.push(
          <Link
            to={`/${PREFIX_ROUTES}/${departure.pattern.route.gtfsId}/${PREFIX_STOPS}/${departure.pattern.code}?sort=no`}
            key={id}
            onClick={() => {
              addAnalyticsEvent({
                category: 'Stop',
                action: 'OpenRouteViewFromStop',
                name: 'RightNowTab',
              });
            }}
            role="row"
          >
            {departureObj}
          </Link>,
        );
      } else {
        departureObjs.push(departureObj);
      }
    });

    return (
      <>
        {screenReaderAlert}
        <div
          className={cx('departure-list', this.props.className)}
          onScroll={this.onScroll()}
          role="table"
        >
          {departureObjs}
        </div>
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
