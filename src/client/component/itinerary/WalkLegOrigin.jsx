import cx from 'classnames';
import PropTypes from 'prop-types';
import ShowOnMapButton from './ShowOnMapButton';
import LegArrowIcon from './LegArrowIcon';
import AddressPlace from './AddressPlace';

export default function WalkLegOrigin({ address, place, showArrow, target, focusAction }) {
  return (
    <div className={cx('itinerary-leg-first-row', 'walk', 'first')}>
      <AddressPlace address={address} place={place}>
        {showArrow && <LegArrowIcon />}
      </AddressPlace>
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
