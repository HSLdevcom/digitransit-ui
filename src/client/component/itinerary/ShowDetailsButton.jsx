import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Icon from '../Icon';

export default function ShowDetailsButton({ ariaLabel, onClick }) {
  const { formatMessage } = useIntl();

  return (
    <button
      type="button"
      className="show-details-button"
      title={formatMessage({ id: 'itinerary-page.show-details' })}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Icon img="icon_arrow-collapse--right" />
    </button>
  );
}

ShowDetailsButton.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
