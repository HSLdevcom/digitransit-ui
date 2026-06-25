import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { transitIconName } from '../../util/modeUtils';
import { resolveNoDeparturesBadge } from '../../util/stopStatusUtils';
import { alertShape } from '../../util/shapes';
import { useConfigContext } from '../../configurations/ConfigContext';
import StopScheduleStatus from './StopScheduleStatus';

export default function StopServiceStatusBanner({
  mode,
  modeColor = undefined,
  stoptimes,
  currentTime,
  alerts = undefined,
  servicesRunningInFuture = true,
}) {
  const config = useConfigContext();
  const noDepartures = stoptimes.length === 0;

  if (
    !noDepartures &&
    (!config.showStopStatusMarkers ||
      stoptimes.some(st => st.serviceDay < currentTime))
  ) {
    return null;
  }

  const { stopStatus, badgeImg, alertEffects } = resolveNoDeparturesBadge(
    alerts,
    currentTime,
    config.showStopStatusMarkers,
    noDepartures ? servicesRunningInFuture : true,
  );

  return (
    <div
      className={
        noDepartures
          ? 'stop-no-departures-container'
          : 'stop-service-status-banner'
      }
    >
      <div className="stop-no-departures-icon-wrapper">
        <Icon
          img={transitIconName(mode, true)}
          className="stop-no-departures-icon"
          color={modeColor}
          viewBox="0 0 16 22"
        />
        {badgeImg && (
          <Icon img={badgeImg} className="stop-no-departures-badge" />
        )}
      </div>
      {stopStatus ? (
        <StopScheduleStatus status={stopStatus} alertEffects={alertEffects} />
      ) : (
        noDepartures && (
          <FormattedMessage id="no-departures" defaultMessage="No departures" />
        )
      )}
    </div>
  );
}

StopServiceStatusBanner.propTypes = {
  mode: PropTypes.string.isRequired,
  modeColor: PropTypes.string,
  stoptimes: PropTypes.arrayOf(
    PropTypes.shape({ serviceDay: PropTypes.number.isRequired }),
  ).isRequired,
  currentTime: PropTypes.number.isRequired,
  alerts: PropTypes.arrayOf(alertShape),
  servicesRunningInFuture: PropTypes.bool,
};
