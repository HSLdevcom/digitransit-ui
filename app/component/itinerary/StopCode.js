import React from 'react';


// TODO see if this can be combined with stop-reference?
const StopCode = ({ code }) => <span className="itinerary-stop-code">{code}</span>;

StopCode.displayName = 'StopCode';
StopCode.propTypes = {
  code: React.PropTypes.string.isRequired,
};
export default StopCode;
