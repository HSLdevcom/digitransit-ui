import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage, intlShape } from 'react-intl';
import { matchShape, routerShape, RedirectException } from 'found';

import DepartureListContainer from './DepartureListContainer';
import Loading from './Loading';
import Icon from './Icon';
import ScrollableWrapper from './ScrollableWrapper';
import { isBrowser } from '../util/browser';
import { PREFIX_STOPS } from '../util/path';
import { startRealTimeClient } from '../action/realTimeClientAction';

/**
 * 
 * dropoffType: "SCHEDULED"
​​
headsign: null
​​
pickupType: "NONE"
​​
realtime: true
​​
realtimeArrival: 44578
​​
realtimeDeparture: 44631
​​
realtimeState: "UPDATED"
​​
scheduledArrival: 44640
​​
scheduledDeparture: 44640
​​
serviceDay: 1693256400
stop {
  code: "H2139"
​​​
id: "U3RvcDpIU0w6MTAyMDIwMQ"
​​​
platformCode: null
}
trip {
  directionId: "1"
​​​
gtfsId: "HSL:1071_20230825_Ti_2_1145"
tripHeadsign: "Rautatientori"
}
 */

const asDepartures = stoptimes =>
  !stoptimes
    ? []
    : stoptimes.map(stoptime => {
        const hasDropoff = stoptime.dropoffType !== 'NONE';
        const hasPickup = stoptime.pickupType !== 'NONE';
        const hasNoStop = !hasPickup && !hasDropoff;
        const isArrival = !hasPickup;
        let isLastStop = false;
        if (stoptime && stoptime.trip && stoptime.trip.stops) {
          const lastStop = stoptime.trip.stops.slice(-1).pop();
          isLastStop = stoptime.stop.id === lastStop.id;
        }
        const hasOnlyDropoff = !hasPickup && !isLastStop;
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

//        const { pattern } = stoptime.trip;
        return {
          canceled: false,
          isArrival: false,
          hasNoStop: false,
          hasOnlyDropoff: false,
          isLastStop: false,
          stoptime: 44631,
          stop: {
            code: "H2139",
            id: "U3RvcDpIU0w6MTAyMDIwMQ"
          },
          realtime: true,
          pattern: {
            code: "HSL:1071:1:01"
          },
          headsign: null,
          trip: {
            directionId: "1",
            gtfsId: "HSL:1071_20230825_Ti_2_1145",
            tripHeadsign: "Rautatientori"
          }

//           canceled,
//           isArrival,
//           hasNoStop,
//           hasOnlyDropoff,
//           isLastStop,
//           stoptime: stoptimeTime,
//           stop: stoptime.stop,
//           realtime: stoptime.realtime,
//           // pattern,
//           headsign: stoptime.headsign,
// //          trip: stoptime.trip,
//           pickupType: stoptime.pickupType,
//           serviceDay: stoptime.serviceDay,
        };
      });

const StopShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
});

const TripShape = PropTypes.shape({
  stops: PropTypes.arrayOf(StopShape),
});

const StopTimeShape = PropTypes.shape({
  dropoffType: PropTypes.string.isRequired,
  pickupType: PropTypes.string.isRequired,
  trip: TripShape,
});

class StopPageContent extends React.Component {
  static propTypes = {
    stop: PropTypes.shape({
      stoptimes: PropTypes.arrayOf(StopTimeShape).isRequired,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
    error: PropTypes.object,
    router: routerShape.isRequired,
    match: matchShape,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch(oldVariables => {
        return { ...oldVariables, startTime: currentTime };
      });
    }
  }

  componentDidMount() {
    const departures = asDepartures(this.props.stop.stoptimes)
      .filter(departure => !(false && departure.isArrival))
      .filter(departure => this.props.currentTime < departure.stoptime).filter(departure => departure.realtime && !departure.canceled);
    this.startClient(departures)
    // Throw error in client side if relay fails to fetch data
    if (this.props.error && !this.props.stop) {
      throw this.props.error.message;
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

  render() {
    // Render something in client side to clear SSR
    if (isBrowser && this.props.error && !this.props.stop) {
      return <Loading />;
    }

    if (!this.props.stop && !this.props.error) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Stops page */
      if (isBrowser) {
        this.props.router.replace(`/${PREFIX_STOPS}`);
      } else {
        throw new RedirectException(`/${PREFIX_STOPS}`);
      }
      return null;
    }

    const { stoptimes } = this.props.stop;
    const { stopId } = this.props.match.params;
    const { constantOperationStops } = this.context.config;
    const { locale } = this.context.intl;
    if (constantOperationStops && constantOperationStops[stopId]) {
      return (
        <div className="stop-constant-operation-container">
          <div style={{ width: '85%' }}>
            <span>{constantOperationStops[stopId][locale].text}</span>
            {/* Next span inline-block so that the link doesn't render on multiple lines */}
            <span style={{ display: 'inline-block' }}>
              <a href={constantOperationStops[stopId][locale].link}>
                {constantOperationStops[stopId][locale].link}
              </a>
            </span>
          </div>
        </div>
      );
    }
    if (!stoptimes || stoptimes.length === 0) {
      return (
        <div className="stop-no-departures-container">
          <Icon img="icon-icon_station" />
          <FormattedMessage id="no-departures" defaultMessage="No departures" />
        </div>
      );
    }
    return (
      <ScrollableWrapper>
        <div className="stop-page-departure-wrapper stop-scroll-container">
          <DepartureListContainer
            stoptimes={stoptimes}
            key="departures"
            className="stop-page momentum-scroll"
            infiniteScroll
            currentTime={this.props.currentTime}
            isStopPage
          />
        </div>
      </ScrollableWrapper>
    );
  }
}

const connectedComponent = createRefetchContainer(
  connectToStores(StopPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime().unix(),
  })),
  {
    stop: graphql`
      fragment StopPageContentContainer_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        timeRange: { type: "Int!", defaultValue: 864000 }
        numberOfDepartures: { type: "Int!", defaultValue: 100 }
      ) {
        url
        stoptimes: stoptimesWithoutPatterns(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
          omitCanceled: false
        ) {
          ...DepartureListContainer_stoptimes
        }
      }
    `,
  },
  graphql`
    query StopPageContentContainerQuery(
      $stopId: String!
      $startTime: Long!
      $timeRange: Int!
      $numberOfDepartures: Int!
    ) {
      stop(id: $stopId) {
        ...StopPageContentContainer_stop
        @arguments(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        )
      }
    }
  `,
);

export { connectedComponent as default, StopPageContent as Component };
