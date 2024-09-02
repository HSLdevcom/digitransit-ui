import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
export default function NavigatorButton({ setNavigation }) {
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
        onClick={() => setNavigation(true)}
      >
        <FormattedMessage
          id="start-navigation"
          defaultMessage="start-navigation"
        />
      </button>
    </div>
  );
}

NavigatorButton.propTypes = {
  setNavigation: PropTypes.func.isRequired,
};
