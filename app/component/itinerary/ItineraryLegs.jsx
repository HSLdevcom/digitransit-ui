import { forwardRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Icon from '../Icon';

const ItineraryLegs = forwardRef(
  ({ legs, showOverflowIcon, iconLegsInPixels }, overflowRef) => (
    <div
      className="legs-container"
      style={{ '--minus': `${iconLegsInPixels}px` }}
      key="legs"
      aria-hidden="true"
    >
      <div
        className={cx(
          'itinerary-legs',
          showOverflowIcon ? 'overflow-icon' : '',
        )}
        ref={overflowRef}
      >
        {legs}
      </div>
      <div className="overflow-icon-container">
        {showOverflowIcon && (
          <Icon img="icon_three-dots" className="overflow-icon" />
        )}
      </div>
    </div>
  ),
);

ItineraryLegs.displayName = 'ItineraryLegs';

ItineraryLegs.propTypes = {
  legs: PropTypes.node.isRequired,
  showOverflowIcon: PropTypes.bool.isRequired,
  iconLegsInPixels: PropTypes.number.isRequired,
};

export default ItineraryLegs;
