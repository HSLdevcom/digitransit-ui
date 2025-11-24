import React from 'react';
import PropTypes from 'prop-types';

const STOP_SIGN_POLE_WIDTH = 4;
const STOP_SIGN_POLE_X = 20 - STOP_SIGN_POLE_WIDTH / 2;

const IconBackground = ({ backgroundShape, backgroundColor }) => (
  <>
    <circle
      className="icon-circle"
      cx="20"
      cy="20"
      fill={backgroundColor}
      r={backgroundShape === 'stopsign' ? '13.33' : '20'}
    />
    {backgroundShape === 'stopsign' && (
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
  backgroundShape: PropTypes.oneOf(['circle', 'stopsign']).isRequired,
  backgroundColor: PropTypes.string,
};

IconBackground.defaultProps = {
  backgroundColor: 'white',
};

export default IconBackground;
