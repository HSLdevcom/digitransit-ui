import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { isKeyboardSelectionEvent } from '../../../shared/utils/browser';
import Icon from '../Icon';

export default function ShowOnMapButton({
  target,
  focusAction,
  ariaLabelId = 'itinerary-summary.show-on-map',
}) {
  const intl = useIntl();
  return (
    <div
      className="itinerary-map-action"
      onClick={focusAction}
      onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
      role="button"
      tabIndex="0"
      aria-label={intl.formatMessage({ id: ariaLabelId }, { target })}
    >
      <Icon img="icon_show-on-map" className="itinerary-search-icon" />
    </div>
  );
}

ShowOnMapButton.propTypes = {
  focusAction: PropTypes.func.isRequired,
  target: PropTypes.string.isRequired,
  ariaLabelId: PropTypes.string,
};
