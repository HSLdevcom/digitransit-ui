import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../Icon';
import { transitIconName } from '../../util/modeUtils';
import {
  STOP_STATUS,
  STOP_STATUS_BADGE_IMGS,
} from '../../util/stopStatusUtils';
import { useConfigContext } from '../../configurations/ConfigContext';
import StopScheduleStatus from './StopScheduleStatus';

export default function StopServiceStatusBanner({
  mode,
  modeColor,
  stoptimes,
  currentTime,
}) {
  const config = useConfigContext();

  if (
    !config.showStopStatusMarkers ||
    stoptimes.some(st => st.serviceDay < currentTime)
  ) {
    return null;
  }

  const status = STOP_STATUS.NO_SERVICE_TODAY;
  const badgeImg = STOP_STATUS_BADGE_IMGS[STOP_STATUS.NO_SERVICE_TODAY];

  return (
    <div className="stop-service-status-banner">
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
      <StopScheduleStatus status={status} />
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
};

StopServiceStatusBanner.defaultProps = {
  modeColor: undefined,
};
