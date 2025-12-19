import React from 'react';
import PropTypes from 'prop-types';

const STOP_SIGN_POLE_WIDTH = 4;
const STOP_SIGN_POLE_X = 20 - STOP_SIGN_POLE_WIDTH / 2;

const IconBackground = ({ shape, color }) => (
  <>
    <circle
      className="icon-circle"
      cx="20"
      cy="20"
      fill={color}
      r={shape === 'stopsign' ? '13.33' : '20'}
    />
    {shape === 'stopsign' && (
      <rect
        x={STOP_SIGN_POLE_X}
        y="33.33"
        width={STOP_SIGN_POLE_WIDTH}
        height="6.67"
        fill="#333333"
        rx="2"
      />
    )}
  </>
);

IconBackground.propTypes = {
  shape: PropTypes.oneOf(['circle', 'stopsign']).isRequired,
  color: PropTypes.string,
};

IconBackground.defaultProps = {
  color: 'white',
};

export default IconBackground;
