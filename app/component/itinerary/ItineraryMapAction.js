import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { isKeyboardSelectionEvent } from '../../util/browser';
import Icon from '../Icon';

function ItineraryMapAction({ target, focusAction, ariaLabelId }, { intl }) {
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div
      className="itinerary-map-action"
      onClick={focusAction}
      onKeyPress={e => isKeyboardSelectionEvent(e) && focusAction(e)}
      role="button"
      tabIndex="0"
      aria-label={intl.formatMessage({ id: ariaLabelId }, { target })}
    >
      <Icon img="icon-icon_show-on-map" className="itinerary-search-icon" />
    </div>
  );
}

ItineraryMapAction.propTypes = {
  focusAction: PropTypes.func.isRequired,
  target: PropTypes.string.isRequired,
  ariaLabelId: PropTypes.string,
};

ItineraryMapAction.defaultProps = {
  ariaLabelId: 'itinerary-summary.show-on-map',
};

ItineraryMapAction.contextTypes = {
  intl: intlShape.isRequired,
};

export default ItineraryMapAction;
