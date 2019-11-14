import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';

export default function LoginButton() {
  return (
    <div className="top-bar-login">
      <div className="navi-icons">
        <Icon img="icon-icon_user" />
      </div>
      <div className="right-border">
        <FormattedMessage id="login" defaultMessage="login" />
      </div>
    </div>
  );
}
