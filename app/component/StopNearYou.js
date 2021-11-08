import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { PREFIX_STOPS, PREFIX_TERMINALS } from '../util/path';
import StopNearYouHeader from './StopNearYouHeader';
import StopNearYouAlert from './StopNearYouAlert';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';

const StopNearYou = ({
  stop,
  desc,
  stopIsStation,
  currentTime,
  currentMode,
  relay,
}) => {
  const stopOrStation = stop.parentStation ? stop.parentStation : stop;
  const stopMode = stopOrStation.stoptimesWithoutPatterns[0]?.trip.route.mode;
  const alert = stop.alerts?.length > 0 ? stop.alerts[0] : null;
  useEffect(() => {
    const id = stop.gtfsId;
    if (currentMode === stopMode) {
      relay?.refetch(oldVariables => {
        return { ...oldVariables, stopId: id, startTime: currentTime };
      }, null);
    }
  }, [currentTime, currentMode]);
  const description = desc || stop.desc;
  const isStation = !!stop.parentStation || stopIsStation;
  const gtfsId =
    (stop.parentStation && stop.parentStation.gtfsId) || stop.gtfsId;
  const linkAddress = isStation
    ? `/${PREFIX_TERMINALS}/${gtfsId}`
    : `/${PREFIX_STOPS}/${gtfsId}`;
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <StopNearYouHeader
          stop={stopOrStation}
          desc={description}
          isStation={isStation}
          linkAddress={linkAddress}
        />
        <span className="sr-only">
          <FormattedMessage
            id="departure-list-update.sr-instructions"
            default="The departure list and estimated departure times will update in real time."
          />
        </span>
        {alert && <StopNearYouAlert stop={stop} linkAddress={linkAddress} />}
        <StopNearYouDepartureRowContainer
          currentTime={currentTime}
          mode={stopMode}
          stopTimes={stopOrStation.stoptimesWithoutPatterns}
          isStation={isStation && stopMode !== 'SUBWAY'}
        />
        <Link
          className="stop-near-you-more-departures"
          as="button"
          onClick={e => {
            e.stopPropagation();
          }}
          to={linkAddress}
        >
          <FormattedMessage
            id="more-departures"
            defaultMessage="More departures"
          />
        </Link>
      </div>
    </span>
  );
};

StopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  stopIsStation: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  currentMode: PropTypes.string.isRequired,
  desc: PropTypes.string,
  relay: PropTypes.any,
};

StopNearYou.defaultProps = {
  stopIsStation: false,
};

export default StopNearYou;
