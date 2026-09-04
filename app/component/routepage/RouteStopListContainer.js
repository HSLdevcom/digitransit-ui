import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import { createRefetchContainer, graphql } from 'react-relay';
import { useRouter } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { relayShape, vehicleShape, patternShape } from '../../util/shapes';
import RouteStop from './RouteStop';
import withBreakpoint from '../../util/withBreakpoint';
import { useCurrentTime } from '../../hooks/TimeContext';
import { getRouteMode } from '../../util/modeUtils';
import { getModeIconColor } from '../../util/colorUtils';
import { useConfigContext } from '../../configurations/ConfigContext';

function RouteStopListContainer({
  pattern,
  className = undefined,
  vehicles = [],
  relay,
  breakpoint,
  hideDepartures = false,
}) {
  const config = useConfigContext();
  const currentTime = useCurrentTime();
  const { match } = useRouter();
  const isMountRef = useRef(true);

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false;
      return;
    }
    const startOfDay = DateTime.fromSeconds(currentTime)
      .startOf('day')
      .toUnixInteger();
    relay.refetch(
      { currentTime, patternId: match.params.patternId, startOfDay },
      null,
    );
  }, [currentTime]);

  const { stops } = pattern;
  const mode = getRouteMode(pattern.route, config);
  const vehiclesByStop = groupBy(
    values(vehicles).filter(
      vehicle => currentTime - vehicle.timestamp < 5 * 60,
    ),
    vehicle => vehicle.next_stop,
  );
  const rowClassName = `bp-${breakpoint}`;
  const loop =
    stops.length && stops[0].gtfsId === stops[stops.length - 1].gtfsId;
  let singleLoop; // runs only once through the stop chain
  if (loop) {
    let i;
    for (i = 1; i < stops.length - 1; i++) {
      if (stops[i].stopTimesForPattern[1]) {
        // stop is visited many times
        break;
      }
    }
    singleLoop = i === stops.length - 1; // no double time values
  }

  return (
    <div id="route-stop-panel" role="tabpanel" aria-labelledby="route-stop-tab">
      <span className="sr-only">
        <FormattedMessage
          id="stop-list-update.sr-instructions"
          default="Departure times for each stop update in real time."
        />
      </span>
      <ul className={cx('route-stop-list', className)}>
        {stops.map((stop, i) => {
          const nextStop = stops[i + 1];
          const prevStop = stops[i - 1];
          const occurrence = stops
            .slice(0, i)
            .filter(s => s.gtfsId === stop.gtfsId).length;
          return (
            <RouteStop
              color={
                pattern.route?.color
                  ? `#${pattern.route.color}`
                  : getModeIconColor(config, mode)
              }
              key={`${stop.gtfsId}-${occurrence}`}
              stop={stop}
              nextStop={nextStop}
              prevStop={prevStop}
              mode={mode}
              vehicle={vehiclesByStop[stop.gtfsId]?.[0]}
              currentTime={currentTime}
              last={i === stops.length - 1}
              first={i === 0}
              className={rowClassName}
              displayNextDeparture={config.displayNextDeparture}
              shortName={pattern.route?.shortName}
              hideDepartures={hideDepartures}
              loop={loop}
              singleLoop={singleLoop}
            />
          );
        })}
      </ul>
    </div>
  );
}

RouteStopListContainer.propTypes = {
  pattern: patternShape.isRequired,
  className: PropTypes.string,
  vehicles: PropTypes.objectOf(vehicleShape),
  relay: relayShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  hideDepartures: PropTypes.bool,
};

const containerComponent = createRefetchContainer(
  connectToStores(
    withBreakpoint(RouteStopListContainer),
    ['RealTimeInformationStore', 'PositionStore'],
    ({ getStore }) => ({
      vehicles: getStore('RealTimeInformationStore').vehicles,
    }),
  ),
  {
    pattern: graphql`
      fragment RouteStopListContainer_pattern on Pattern
      @argumentDefinitions(
        currentTime: { type: "Long!", defaultValue: 0 }
        patternId: { type: "String!", defaultValue: "0" }
        startOfDay: { type: "Long!", defaultValue: 0 }
      ) {
        directionId
        route {
          mode
          color
          shortName
          type
          gtfsId
        }
        stops {
          alerts {
            alertEffect
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
          serviceToday: stoptimesWithoutPatterns(
            startTime: $startOfDay
            timeRange: 86400
            numberOfDepartures: 1
            omitCanceled: true
          ) {
            serviceDay
          }
          stoptimesWithoutPatterns(
            startTime: $currentTime
            timeRange: 7776000
            numberOfDepartures: 1
            omitCanceled: true
          ) {
            serviceDay
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
      $startOfDay: Long!
    ) {
      pattern(id: $patternId) {
        ...RouteStopListContainer_pattern
          @arguments(
            currentTime: $currentTime
            patternId: $patternId
            startOfDay: $startOfDay
          )
      }
    }
  `,
);

export { containerComponent as default, RouteStopListContainer as Component };
