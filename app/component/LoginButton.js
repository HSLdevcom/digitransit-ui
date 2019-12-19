import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default function LoginButton() {
  return (
    <button className="noborder">
      <a href="/login">
        <div className="top-bar-login">
          <div className="login-icon">
            <Icon img="icon-icon_user" />
          </div>
          <FormattedMessage id="login" defaultMessage="login" />
        </div>
      </a>
    </button>
  );
}
