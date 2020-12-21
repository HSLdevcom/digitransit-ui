import React from 'react';
import PropTypes from 'prop-types';
import StopNearYouHeader from './StopNearYouHeader';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';

const StopNearYou = ({ stop, ...props }) => {
  const stopOrStation = stop.parentStation ? stop.parentStation : stop;
  const desc = stopOrStation.desc ? stopOrStation.desc : stop.desc;
  const isStation = !!stop.parentStation;
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <StopNearYouHeader
          stop={stopOrStation}
          desc={desc}
          isStation={isStation}
        />
        <StopNearYouDepartureRowContainer
          stopTimes={stopOrStation.stoptimesWithoutPatterns}
          currentTime={props.currentTime}
          isStation={isStation && stop.vehicleMode !== 'SUBWAY'}
        />
      </div>
    </span>
  );
};

StopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default StopNearYou;
