import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const ToTripButton = (props, context) => {
  return (
    <div className="to-trip-button-class">
      <div className="to-trip-icon">
        <Icon img="icon-icon_show-on-map" className="itinerary-search-icon" />
      </div>

      <div className="to-trip-instruction-text">
        {context.intl.formatMessage({
          id: props.ariaLabel,
          defaultMessage: props.ariaLabel,
        })}
      </div>

      <div className="to-trip-instruction-button">
        <button
          type="button"
          aria-label={context.intl.formatMessage({
            id: 'follow',
            defaultMessage: 'follow',
          })}
          onClick={e => props.buttonClickAction(e)}
        >
          <FormattedMessage
            id="followtheitinerary"
            defaultMessage="followtheitinerary"
          />
        </button>
      </div>
    </div>
  );
};

ToTripButton.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  buttonClickAction: PropTypes.func.isRequired,
};

ToTripButton.defaultProps = {};

ToTripButton.contextTypes = {
  intl: intlShape.isRequired,
};

export default ToTripButton;
