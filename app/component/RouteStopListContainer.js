import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { matchShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import {
  configShape,
  relayShape,
  vehicleShape,
  patternShape,
} from '../util/shapes';
import RouteStop from './RouteStop';
import withBreakpoint from '../util/withBreakpoint';
import { getRouteMode } from '../util/modeUtils';

class RouteStopListContainer extends React.PureComponent {
  static propTypes = {
    pattern: patternShape.isRequired,
    className: PropTypes.string,
    vehicles: PropTypes.objectOf(vehicleShape),
    currentTime: PropTypes.instanceOf(moment).isRequired,
    relay: relayShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    hideDepartures: PropTypes.bool,
  };

  static defaultProps = {
    className: undefined,
    vehicles: [],
    hideDepartures: false,
  };

  static contextTypes = {
    config: configShape.isRequired,
    match: matchShape.isRequired,
  };

  getStops() {
    const { stops } = this.props.pattern;

    const mode = getRouteMode(this.props.pattern.route);
    const vehicles = groupBy(
      values(this.props.vehicles).filter(
        vehicle =>
          this.props.currentTime - vehicle.timestamp * 1000 < 5 * 60 * 1000,
      ),
      vehicle => vehicle.next_stop,
    );
    const rowClassName = `bp-${this.props.breakpoint}`;

    return stops.map((stop, i) => {
      const idx = i;
      const nextStop = stops[i + 1];
      const prevStop = stops[i - 1];

      return (
        <RouteStop
          color={
            this.props.pattern.route && this.props.pattern.route.color
              ? `#${this.props.pattern.route.color}`
              : null
          }
          key={`${stop.gtfsId}-${this.props.pattern}-${idx}`}
          stop={stop}
          nextStop={nextStop}
          prevStop={prevStop}
          mode={mode}
          vehicle={vehicles[stop.gtfsId] ? vehicles[stop.gtfsId][0] : null}
          currentTime={this.props.currentTime.unix()}
          last={i === stops.length - 1}
          first={i === 0}
          className={rowClassName}
          displayNextDeparture={this.context.config.displayNextDeparture}
          shortName={
            this.props.pattern.route && this.props.pattern.route.shortName
          }
          hideDepartures={this.props.hideDepartures}
        />
      );
    });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime.unix();
    const nextUnix = currentTime.unix();
    if (currUnix !== nextUnix) {
      relay.refetch(
        {
          currentTime: nextUnix,
          patternId: this.context.match.params.patternId,
        },
        null,
      );
    }
  }

  render() {
    return (
      <div role="tabpanel" aria-labelledby="route-tab">
        <span className="sr-only">
          <FormattedMessage
            id="stop-list-update.sr-instructions"
            default="Departure times for each stop update in real time."
          />
        </span>
        <ul className={cx('route-stop-list', this.props.className)}>
          {this.getStops()}
        </ul>
      </div>
    );
  }
}

const containerComponent = createRefetchContainer(
  connectToStores(
    withBreakpoint(RouteStopListContainer),
    ['RealTimeInformationStore', 'PositionStore', 'TimeStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
      currentTime: getStore('TimeStore').getCurrentTime(),
    }),
  ),
  {
    pattern: graphql`
      fragment RouteStopListContainer_pattern on Pattern
      @argumentDefinitions(
        currentTime: { type: "Long!", defaultValue: 0 }
        patternId: { type: "String!", defaultValue: "0" }
      ) {
        directionId
        route {
          mode
          color
          shortName
          type
        }
        stops {
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
          stopTimesForPattern(id: $patternId, startTime: $currentTime) {
            realtime
            realtimeState
            realtimeArrival
            realtimeDeparture
            serviceDay
            scheduledDeparture
            pickupType
            stop {
              platformCode
            }
          }
          gtfsId
          lat
          lon
          name
          desc
          code
          platformCode
          zoneId
        }
      }
    `,
  },
  graphql`
    query RouteStopListContainerQuery(
      $patternId: String!
      $currentTime: Long!
    ) {
      pattern(id: $patternId) {
        ...RouteStopListContainer_pattern
          @arguments(currentTime: $currentTime, patternId: $patternId)
      }
    }
  `,
);

export { containerComponent as default, RouteStopListContainer as Component };
