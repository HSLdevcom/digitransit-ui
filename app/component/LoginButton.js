import React from 'react';
import Icon from './Icon';

const LoginButton = () => {
  const loginClick = event => {
    event.preventDefault();
    window.location.href = '/login';
  };

  return (
    <div className="login-button-container">
      <button className="noborder" type="button" onClick={loginClick}>
        <Icon img="icon-icon_user" />
      </button>
    </div>
  );
};

export default LoginButton;
