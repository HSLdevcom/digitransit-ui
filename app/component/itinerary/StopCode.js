import React from 'react';

const StopCode = props => <span className="itinerary-stop-code">{props.code}</span>;

StopCode.displayName = 'StopCode';
StopCode.propTypes = {
  code: React.PropTypes.string.isRequired,
};
export default StopCode;
