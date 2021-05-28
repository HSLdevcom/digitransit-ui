import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const LoginButton = ({ loginUrl }) => {
  const loginClick = event => {
    event.preventDefault();
    window.location.href = loginUrl;
  };

  return (
    <div className="login-button-container">
      <button className="noborder" type="button" onClick={loginClick}>
        <Icon img="icon-icon_user" className="icon" />
      </button>
    </div>
  );
};

LoginButton.propTypes = {
  loginUrl: PropTypes.string.isRequired,
};

export default LoginButton;
