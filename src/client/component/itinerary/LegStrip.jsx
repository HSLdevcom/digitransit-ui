import { forwardRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import StreetBar from './StreetBar';
import TransitBar from './TransitBar';
import ItineraryStreetLeg from './ItineraryStreetLeg';

const ViaPoint = () => (
  <div className="leg via">
    <Icon img="icon_mapMarker" className="itinerary-icon place" />
  </div>
);

const renderItem = ({ type, key, ...props }) => {
  switch (type) {
    case 'via':
      return <ViaPoint key={key} />;
    case 'street':
      return <ItineraryStreetLeg key={key} {...props} />;
    case 'transit':
      return <TransitBar key={key} {...props} />;
    case 'wait':
      return <StreetBar key={key} {...props} />;
    default:
      return null;
  }
};

const LegStrip = forwardRef(function LegStrip(
  { items, showOverflowIcon, iconLegsInPixels },
  overflowRef,
) {
  return (
    <div
      className="legs-container"
      style={{ '--minus': `${iconLegsInPixels}px` }}
      key="legs"
      aria-hidden="true"
    >
      <div
        className={cx('itinerary-legs', showOverflowIcon ? 'overflow-icon' : '')}
        ref={overflowRef}
      >
        {items.map(renderItem)}
      </div>
      <div className="overflow-icon-container">
        {showOverflowIcon && <Icon img="icon_three-dots" className="overflow-icon" />}
      </div>
    </div>
  );
});

LegStrip.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['via', 'street', 'transit', 'wait']).isRequired,
      key: PropTypes.string.isRequired,
    }),
  ).isRequired,
  showOverflowIcon: PropTypes.bool.isRequired,
  iconLegsInPixels: PropTypes.number.isRequired,
};

export default LegStrip;
