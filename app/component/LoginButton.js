import React from 'react';
import Icon from './Icon';

export default function LoginButton() {
  return (
    <div>
      <button className="noborder">
        <a href="/login">
          <div className="top-bar-login">
            <div className="login-icon">
              <Icon img="icon-icon_user" />
            </div>
          </div>
        </a>
      </button>
    </div>
  );
}
