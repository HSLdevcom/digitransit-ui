import React from 'react';
import PropTypes from 'prop-types';
import StopNearYouHeader from './StopNearYouHeader';
import StopNearYouDepartureRowContainer from './StopNearYouDepartureRowContainer';

const StopNearYou = ({ stop, color }) => {
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <StopNearYouHeader stop={stop} color={color} />
        <StopNearYouDepartureRowContainer
          stopTimes={stop.stoptimesWithoutPatterns}
        />
      </div>
    </span>
  );
};

StopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  color: PropTypes.string,
};

export default StopNearYou;
