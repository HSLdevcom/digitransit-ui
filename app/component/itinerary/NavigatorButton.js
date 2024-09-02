import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const NavigatorButton = props => {
  return (
    <div className="navigation-container">
      <div className="navigation-leftgroup">
        <Icon
          img="icon-icon_show-on-map"
          width={1.4}
          height={1.4}
          className="navigation-icon"
        />
        <FormattedMessage
          id="navigation-description"
          defaultMessage="navigation-description"
        />
      </div>
      <button
        className="navigation-button"
        type="button"
        onClick={e => props.buttonClickAction(e)}
      >
        <FormattedMessage
          id="start-navigation"
          defaultMessage="start-navigation"
        />
      </button>
    </div>
  );
};

NavigatorButton.propTypes = {
  buttonClickAction: PropTypes.func.isRequired,
};

NavigatorButton.defaultProps = {};

export default NavigatorButton;
