import { useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import IconMarker from '../IconMarker';
import { locationShape } from '../../../utils/shapes';
import { MARKER_REACH, PIN_LIFT } from './labelPlacement';
import styles from './RouteLineLabel.module.scss';

/**
 * Text label on the map. Placement and dy come from chooseLabelPlacement.
 */
export default function RouteLineLabel({
  position,
  text,
  color,
  placement = 'right',
  dy = 0,
  tailDy = 0,
  tailAngle = 0,
}) {
  const icon = useMemo(
    () => ({
      className: 'route-line-label',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      element: (
        <span
          className={cx(styles.label, styles[placement])}
          style={{
            '--label-color': color,
            '--marker-reach': `${MARKER_REACH}px`,
            '--pin-lift': `${PIN_LIFT}px`,
            '--label-dy': `${dy}px`,
            '--tail-dy': `${tailDy}px`,
            '--tail-angle': `${tailAngle}deg`,
          }}
        >
          {text}
        </span>
      ),
    }),
    [text, color, placement, dy, tailDy, tailAngle],
  );
  return <IconMarker position={position} icon={icon} zIndexOffset={11000} />;
}

RouteLineLabel.propTypes = {
  position: locationShape.isRequired,
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  placement: PropTypes.oneOf(['right', 'left', 'pin']),
  dy: PropTypes.number,
  tailDy: PropTypes.number,
  tailAngle: PropTypes.number,
};
