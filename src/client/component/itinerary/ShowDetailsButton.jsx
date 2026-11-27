import PropTypes from 'prop-types';
import Icon from '../Icon';

export default function ShowDetailsButton({ ariaLabel, onClick }) {
  return (
    <button type="button" className="show-details-button" aria-label={ariaLabel} onClick={onClick}>
      <Icon img="icon_arrow-collapse--right" />
    </button>
  );
}

ShowDetailsButton.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
