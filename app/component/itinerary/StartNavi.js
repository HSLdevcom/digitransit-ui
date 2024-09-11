import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
export default function StartNavi({ setNavigation }) {
  return (
    <div className="navi-start-container">
      <div className="navi-start-leftgroup">
        <Icon
          img="icon-icon_show-on-map"
          width={1.4}
          height={1.4}
          className="navi-start-icon"
        />
        <FormattedMessage
          id="navigation-description"
          defaultMessage="Journey guidance"
        />
      </div>
      <button
        className="navi-start-button"
        type="button"
        onClick={() => setNavigation(true)}
      >
        <FormattedMessage
          id="navigation-start"
          defaultMessage="Start journey"
        />
      </button>
    </div>
  );
}

StartNavi.propTypes = {
  setNavigation: PropTypes.func.isRequired,
};
