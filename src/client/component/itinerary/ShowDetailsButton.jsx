import PropTypes from 'prop-types';
import Icon from '../Icon';

export default function ShowDetailsButton({ title, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      className="show-details-button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Icon img="icon_arrow-collapse--right" />
    </button>
  );
}

ShowDetailsButton.propTypes = {
  title: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
