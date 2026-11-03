import { useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import StopPageMap from '../map/StopPageMap';
import { fragmentRefShape } from '../../../utils/client/shapes';
import { StopPageMapFragment } from './queries/StopPageMapFragment';
import { useConfigContext } from '../../hooks/ConfigContext';
import {
  STOP_STATUS,
  getStopStatusFromStopData,
  getStopAlertEffects,
} from '../../../utils/client/stopStatusUtils';

export default function StopPageMapContainer({ stop: stopRef }) {
  const config = useConfigContext();
  const stop = useFragment(StopPageMapFragment, stopRef);
  if (!stop) {
    return false;
  }

  const nowUnixTime = DateTime.now().toUnixInteger();
  const stopStatus = getStopStatusFromStopData({
    stop,
    nowUnixTime,
    showStopStatusMarkers: config.showStopStatusMarkers,
    servicesRunningOnServiceDate: (stop.serviceToday || []).length > 0,
    servicesRunningInFuture: (stop.stoptimesWithoutPatterns || []).length > 0,
  });
  const stopAlertEffects =
    stopStatus === STOP_STATUS.ALERT || stopStatus === STOP_STATUS.INFO
      ? getStopAlertEffects(stop.alerts, nowUnixTime)
      : null;

  return (
    <StopPageMap
      stop={stop}
      stopStatus={stopStatus}
      stopAlertEffects={stopAlertEffects}
    />
  );
}

StopPageMapContainer.propTypes = {
  stop: fragmentRefShape,
};
