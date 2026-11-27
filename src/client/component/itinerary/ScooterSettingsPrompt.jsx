import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import LegAction from './LegAction';
import { isKeyboardSelectionEvent } from '../../../shared/utils/browser';

/**
 * Suggests turning scooter settings on permanently.
 */
export default function ScooterSettingsPrompt({ focusToLeg, openSettings }) {
  return (
    <div>
      <LegAction
        ariaLabelId="itinerary-list-row.clickable-area-description"
        focusAction={focusToLeg}
      >
        <FormattedMessage id="settings-e-scooter-on" />
      </LegAction>
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
