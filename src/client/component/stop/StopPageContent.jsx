import { graphql, useRefetchableFragment } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMatch } from 'found';
import { errorShape, fragmentRefShape } from '../../utils/shapes';
import DepartureListContainer from '../DepartureListContainer';
import ScrollableWrapper from '../ScrollableWrapper';
import { getPrimaryStopMode } from '../../utils/modeUtils';
import { getModeIconColor } from '../../../shared/colorUtils';
import StopServiceStatusBanner from './StopServiceStatusBanner';
import { useCurrentTime } from '../../hooks/TimeContext';
import useRefetchOnTick from '../../hooks/useRefetchOnTick';
import { useConfigContext } from '../../hooks/ConfigContext';
import { getTrackOrPierOrPlatformText } from '../../utils/localeUtils';

const stopFragment = graphql`
  fragment StopPageContent_stop on Stop
  @refetchable(queryName: "StopPageContentQuery")
  @argumentDefinitions(
    startTime: { type: "Long", defaultValue: 0 }
    timeRange: { type: "Int", defaultValue: 864000 }
    numberOfDepartures: { type: "Int", defaultValue: 100 }
  ) {
    vehicleMode
    code
    url
    routes {
      gtfsId
      mode
      type
    }
    alerts(types: [STOP, ROUTES]) {
      alertEffect
      alertSeverityLevel
      effectiveStartDate
      effectiveEndDate
    }
    futureStoptimes: stoptimesWithoutPatterns(
      startTime: $startTime
      timeRange: 7776000 # 90 days in seconds
      numberOfDepartures: 1
      omitCanceled: true
    ) {
      serviceDay
    }
    stoptimes: stoptimesWithoutPatterns(
      startTime: $startTime
      timeRange: $timeRange
      numberOfDepartures: $numberOfDepartures
      omitCanceled: false
    ) {
      serviceDay
      ...DepartureListContainer_stoptimes
    }
  }
`;

/** Departures of a stop, or of a terminal (station) when the path has a terminalId. */
export default function StopPageContent({ stop: stopRef, error }) {
  const intl = useIntl();
  const config = useConfigContext();
  const currentTime = useCurrentTime();
  const match = useMatch();
  const [stop, refetch] = useRefetchableFragment(stopFragment, stopRef);

  useRefetchOnTick(refetch, stopFragment, stopRef);

  if (!stop && error) {
    throw error.message;
  }

  const { stoptimes } = stop;
  const { stopId, terminalId } = match.params;
  const isTerminal = !!terminalId;
  const { constantOperationStops } = config;
  const { locale } = intl;
  if (!isTerminal && constantOperationStops && constantOperationStops[stopId]) {
    return (
      <div className="stop-constant-operation-container">
        <div style={{ width: '85%' }}>
          <span>{constantOperationStops[stopId][locale].text}</span>
          {/* Next span inline-block so that the link doesn't render on multiple lines */}
          <span style={{ display: 'inline-block' }}>
            <a href={constantOperationStops[stopId][locale].link} target="_blank" rel="noreferrer">
              {constantOperationStops[stopId][locale].link}
            </a>
          </span>
        </div>
      </div>
    );
  }
  const vehicleMode = stop.vehicleMode || 'BUS';
  // `mode` is the icon mode (derived from routes, may differ from vehicleMode for multi-mode stops).
  // `vehicleMode` is used for track text and the departure list.
  const mode = getPrimaryStopMode(stop.routes, vehicleMode, stop.code, config, isTerminal);
  const modeColor = getModeIconColor(config, mode);
  if (!stoptimes || stoptimes.length === 0) {
    return (
      <StopServiceStatusBanner
        mode={mode}
        modeColor={modeColor}
        stoptimes={stoptimes || []}
        currentTime={currentTime}
        alerts={stop.alerts}
        servicesRunningInFuture={(stop.futureStoptimes || []).length > 0}
      />
    );
  }
  return (
    <ScrollableWrapper>
      <div className="stop-page-departure-wrapper stop-scroll-container">
        <StopServiceStatusBanner
          mode={mode}
          modeColor={modeColor}
          stoptimes={stoptimes}
          currentTime={currentTime}
          alerts={stop.alerts}
        />
        {isTerminal && (
          <div className="departure-list-header row padding-vertical-normal" aria-hidden="true">
            <span className="route-number-header">
              <FormattedMessage id="route" defaultMessage="Route" />
            </span>
            <span className="route-destination-header">
              <FormattedMessage id="destination" defaultMessage="Destination" />
            </span>
            <span className="time-header">
              <FormattedMessage id="leaving-at" defaultMessage="Leaves" />
            </span>
            <span className="track-header">{getTrackOrPierOrPlatformText(intl, vehicleMode)}</span>
          </div>
        )}
        <DepartureListContainer
          stoptimes={stoptimes}
          mode={isTerminal ? vehicleMode : undefined}
          key="departures"
          className={isTerminal ? 'stop-page' : 'stop-page momentum-scroll'}
          currentTime={currentTime}
          isTerminal={isTerminal}
          showVehicles={!isTerminal}
        />
      </div>
    </ScrollableWrapper>
  );
}
StopPageContent.propTypes = { stop: fragmentRefShape.isRequired, error: errorShape };
