import PropTypes from 'prop-types';
import React from 'react';

export default function StopCode({ code }) {
  return code && <span className="itinerary-stop-code">{code}</span>;
}
StopCode.propTypes = {
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};
