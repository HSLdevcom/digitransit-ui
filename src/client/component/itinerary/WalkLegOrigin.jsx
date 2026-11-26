import cx from 'classnames';
import PropTypes from 'prop-types';
import ShowOnMapButton from './ShowOnMapButton';
import LegArrowIcon from './LegArrowIcon';

export default function WalkLegOrigin({ address, place, showArrow, target, focusAction }) {
  return (
    <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
      <div className="address-container">
        <div className="address">
          {address}
          {showArrow && <LegArrowIcon />}
        </div>
        <div className="place">{place}</div>
      </div>
      <ShowOnMapButton target={target} focusAction={focusAction} />
    </div>
  );
}

WalkLegOrigin.propTypes = {
  address: PropTypes.string,
  place: PropTypes.string,
  showArrow: PropTypes.bool.isRequired,
  target: PropTypes.string.isRequired,
  focusAction: PropTypes.func.isRequired,
};
