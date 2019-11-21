import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default function LoginButton({ logIn }) {
  return (
    <button className="noborder" onClick={() => logIn()}>
      <div className="top-bar-login">
        <div className="navi-icons">
          <Icon img="icon-icon_user" />
        </div>
        <FormattedMessage id="login" defaultMessage="login" />
      </div>
    </button>
  );
}

LoginButton.propTypes = {
  logIn: PropTypes.func.isRequired,
};
