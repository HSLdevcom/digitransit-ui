import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const NavigatorButton = (props, context) => {
  return (
    <div className="to-trip-button-class">
      <div className="to-trip-icon">
        <Icon img="icon-icon_show-on-map" className="itinerary-search-icon" />
      </div>

      <div className="to-trip-instruction-text">
        {context.intl.formatMessage({
          id: 'navigation-description',
          defaultMessage: 'navigation-description',
        })}
      </div>

      <div className="to-trip-instruction-button">
        <button
          type="button"
          aria-label={context.intl.formatMessage({
            id: 'navigation-header',
            defaultMessage: 'navigation-header',
          })}
          onClick={e => props.buttonClickAction(e)}
        >
          <FormattedMessage
            id="start-navigation"
            defaultMessage="start-navigation"
          />
        </button>
      </div>
    </div>
  );
};

NavigatorButton.propTypes = {
  buttonClickAction: PropTypes.func.isRequired,
};

NavigatorButton.defaultProps = {};

NavigatorButton.contextTypes = {
  intl: intlShape.isRequired,
};

export default NavigatorButton;
