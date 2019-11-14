import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default function LoginButton({ onClick }) {
  return (
    <div className="top-bar-login" onClick={onClick}>
      <div className="navi-icons">
        <Icon img="icon-icon_user" />
      </div>
      <div className="right-border">
        <FormattedMessage id="login" defaultMessage="login" />
      </div>
    </div>
  );
}

LoginButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
