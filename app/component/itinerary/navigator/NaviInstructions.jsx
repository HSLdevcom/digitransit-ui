import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { displayDistance } from '../../../../utils/shared/geo-utils';
import { legShape, configShape } from '../../../../utils/client/shapes';
import {
  legDestination,
  legTimeStr,
  legTime,
  isLocalCallAgency,
} from '../../../../utils/client/legUtils';
import {
  LEGTYPE,
  getLocalizedMode,
  getToLocalizedMode,
  withRealTime,
} from './NaviUtils';
import { getTripOrRouteMode } from '../../../../utils/client/modeUtils';
import BoardingInfo from './BoardingInfo';
import { durationToString } from '../../../../utils/client/timeUtils';

function getBoardingParams(intl, leg, time, config) {
  if (!leg?.transitLeg) {
    return {};
  }
  const { headsign, trip, route, start } = leg;
  const hs = headsign || leg.trip?.tripHeadsign;

  const remainingDuration = durationToString(intl, legTime(start) - time);
  const rt = leg.realtimeState === 'UPDATED';
  const values = {
    duration: withRealTime(rt, remainingDuration),
    legTime: withRealTime(rt, legTimeStr(start)),
  };
  const routeMode = getTripOrRouteMode(trip, route, config);
  return { routeMode, route, hs, values };
}

export default function NaviInstructions(
  {
    leg,
    nextLeg,
    instructions,
    legType,
    time,
    position,
    tailLength,
    showDestinationInfo,
  },
  { config },
) {
  const intl = useIntl();
  const { routeMode, route, hs, values } = getBoardingParams(
    intl,
    nextLeg,
    time,
    config,
  );
  const appendClass = isLocalCallAgency(nextLeg, config) ? 'call-local' : '';
  if (legType === LEGTYPE.MOVE) {
    return (
      <>
        {showDestinationInfo && (
          <div className="notification-header navi-header-chain">
            <FormattedMessage id={instructions} defaultMessage="Go to" />
            &nbsp;
            {legDestination(intl, leg, null, nextLeg)}
            &nbsp;
            <span className={cx({ realtime: !!position })}>
              {displayDistance(tailLength, config, intl.formatNumber)}&nbsp;
            </span>
            {nextLeg?.transitLeg && (
              <FormattedMessage id="navileg-hop-on" defaultMessage="by" />
            )}
          </div>
        )}
        {nextLeg?.transitLeg && (
          <BoardingInfo
            route={route}
            mode={routeMode}
            headsign={hs}
            translationValues={values}
            appendClass={appendClass}
            compact
          />
        )}
      </>
    );
  }

  if (legType === LEGTYPE.WAIT && nextLeg?.transitLeg) {
    const { mode } = nextLeg;
    return (
      <>
        <div className="notification-header">
          <FormattedMessage
            id="navigation-get-mode"
            values={{ mode: getToLocalizedMode(mode, intl) }}
            defaultMessage="Get on the {mode}"
          />
        </div>
        <BoardingInfo
          route={route}
          mode={routeMode}
          headsign={hs}
          translationValues={values}
          appendClass={appendClass}
        />
      </>
    );
  }

  if (legType === LEGTYPE.WAIT_IN_VEHICLE) {
    const totalWait = durationToString(intl, legTime(nextLeg.start) - time);
    return (
      <>
        <div className="notification-header">
          <FormattedMessage
            id="wait-in-vehicle"
            defaultMessage="Wait in the vehicle"
          />
        </div>
        <div className="wait-leg">
          <FormattedMessage
            id="navigation-interline-resume"
            values={{
              duration: withRealTime(
                nextLeg.realtimeState === 'UPDATED',
                totalWait,
              ),
            }}
          />
        </div>
      </>
    );
  }

  if (legType === LEGTYPE.TRANSIT) {
    const rt = leg.realtimeState === 'UPDATED';

    const destId = // eslint-disable-next-line no-nested-ternary
      leg.mode === 'FERRY'
        ? 'navileg-at-ferrypier'
        : leg.to.stop.parentStation
          ? 'navileg-at-station'
          : 'navileg-at-stop';
    const stopOrStation = intl.formatMessage({ id: destId });

    const sameRouteInterline =
      nextLeg?.interlineWithPreviousLeg &&
      leg.route?.shortName === nextLeg.route?.shortName;
    // eslint-disable-next-line no-nested-ternary
    const translationId = nextLeg?.interlineWithPreviousLeg
      ? sameRouteInterline
        ? 'navileg-in-transit-interline-same-route'
        : 'navileg-in-transit-interline'
      : 'navileg-leave-at';

    // Both messages are about reaching leg.to (the stop where either the
    // traveler gets off, or waits onboard while the route number changes).
    // The dedicated WAIT_IN_VEHICLE legType/card takes over with nextLeg's
    // own resume time once actually there.
    const values2 = {
      stopOrStation,
      stop: leg.to.stop.name,
      duration: withRealTime(
        rt,
        durationToString(intl, legTime(leg.end) - time),
      ),
      legTime: withRealTime(rt, legTimeStr(leg.end)),
    };

    return (
      <>
        <div className="notification-header">
          <FormattedMessage
            id={instructions}
            defaultMessage="{mode}trip"
            values={{ mode: getLocalizedMode(leg.mode, intl, config) }}
          />
        </div>
        <div className="vehicle-leg">
          <FormattedMessage
            id={translationId}
            defaultMessage="leave from the vehicle at stop {stop} in {duration} minutes at {legTime}"
            values={values2}
          />
        </div>
      </>
    );
  }
  return null;
}

NaviInstructions.propTypes = {
  leg: legShape,
  nextLeg: legShape,
  instructions: PropTypes.string.isRequired,
  legType: PropTypes.string,
  time: PropTypes.number.isRequired,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  tailLength: PropTypes.number.isRequired,
  showDestinationInfo: PropTypes.bool,
};

NaviInstructions.defaultProps = {
  legType: '',
  leg: undefined,
  nextLeg: undefined,
  position: undefined,
  showDestinationInfo: false,
};
NaviInstructions.contextTypes = {
  config: configShape.isRequired,
};
