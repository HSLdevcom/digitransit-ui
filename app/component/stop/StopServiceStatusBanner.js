import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import ThemedIcon from '../ThemedIcon';
import { resolveNoDeparturesBadge } from '../../util/stopStatusUtils';
import { alertShape } from '../../util/shapes';
import { useConfigContext } from '../../configurations/ConfigContext';
import StopScheduleStatus from './StopScheduleStatus';

function getModeStopIconName(mode) {
  switch (mode) {
    case 'bus':
    case 'bus-express':
    case 'bus-local':
    case 'replacement-bus':
      return 'BusStop';
    case 'tram':
      return 'TramStop';
    case 'train':
    case 'rail':
      return 'TrainStop';
    case 'subway':
    case 'metro':
      return 'MetroStop';
    case 'ferry':
      return 'FerryStop';
    case 'citybike':
      return 'CitybikeStation';
    case 'scooter':
      return 'ScooterStop';
    case 'speedtram':
      return 'SpeedtramStop';
    default:
      return 'GenericStop';
  }
}

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
        <ThemedIcon
          name={getModeStopIconName(mode)}
          className="stop-no-departures-icon"
          customColor={modeColor}
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
