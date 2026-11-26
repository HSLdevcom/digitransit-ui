import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import Icon from '../Icon';
import ShowOnMapButton from './ShowOnMapButton';
import { isKeyboardSelectionEvent } from '../../../shared/utils/browser';

/**
 * Suggests turning scooter settings on permanently.
 */
export default function ScooterSettingsPrompt({ focusToLeg, openSettings }) {
  return (
    <div>
      <div className={cx('itinerary-leg-action', 'scooter', 'itinerary-leg-action-content')}>
        <FormattedMessage
          id="settings-e-scooter-on"
          defaultMessage="Turn scooter settings on permanently"
        />
        <ShowOnMapButton
          target=""
          ariaLabelId="itinerary-list-row.clickable-area-description"
          focusAction={focusToLeg}
        />
      </div>
      <div
        role="button"
        tabIndex="0"
        onClick={() => openSettings(true, true)}
        onKeyPress={e => isKeyboardSelectionEvent(e) && openSettings(true, true)}
        className="itinerary-transit-leg-route-with-link"
      >
        <div className="itinerary-with-link">
          <div className="itinerary-with-link-text-container">
            <span className="settings">
              <FormattedMessage id="open-settings" defaultMessage="Go to settings" />
            </span>
          </div>
        </div>
        <div className="link-to-e-scooter-operator">
          <Icon img="icon_arrow-collapse--right" height={1} width={1} />
        </div>
      </div>
    </div>
  );
}

ScooterSettingsPrompt.propTypes = {
  focusToLeg: PropTypes.func.isRequired,
  openSettings: PropTypes.func.isRequired,
};
