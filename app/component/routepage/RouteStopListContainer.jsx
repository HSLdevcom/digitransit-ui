import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import { useRefetchableFragment } from 'react-relay';
import { useRouter } from 'found';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { fragmentRefShape } from '../../../utils/client/shapes';
import { useRealTimeInformation } from '../../hooks/RealTimeInformationContext';
import RouteStop from './RouteStop';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { useCurrentTime } from '../../hooks/TimeContext';
import { getRouteMode } from '../../../utils/client/modeUtils';
import { getModeIconColor } from '../../../utils/shared/colorUtils';
import RouteStopListContainerFragment from './queries/RouteStopListContainerFragment';
import { useConfigContext } from '../../hooks/ConfigContext';

function RouteStopListContainer({
  pattern: patternRef,
  className = undefined,
  hideDepartures = false,
}) {
  const config = useConfigContext();
  const currentTime = useCurrentTime();
  const { match } = useRouter();
  const isMountRef = useRef(true);
  const breakpoint = useBreakpoint();
  const { vehicles } = useRealTimeInformation();
  const [pattern, refetch] = useRefetchableFragment(
    RouteStopListContainerFragment,
    patternRef,
  );

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false;
      return;
    }
    const startOfDay = DateTime.fromSeconds(currentTime)
      .startOf('day')
      .toUnixInteger();
    refetch({
      currentTime,
      patternId: match.params.patternId,
      startOfDay,
      showStopStatusMarkers: !!config.showStopStatusMarkers,
    });
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
  pattern: fragmentRefShape,
  className: PropTypes.string,
  hideDepartures: PropTypes.bool,
};

export default RouteStopListContainer;
